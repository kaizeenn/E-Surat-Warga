import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import api from '../services/api';
import {
  saveSession, clearSession, getToken, getStoredUser, getLoginAt,
  decodeToken, getSessionRemainingMs, isSessionExpired,
} from '../utils/session';

const AuthContext = createContext(null);

/**
 * AuthProvider — kelola sesi login (token JWT) untuk seluruh aplikasi.
 *
 * Fitur sesi:
 *  - simpan token & user ke localStorage
 *  - validasi token saat aplikasi dimuat (GET /auth/me)
 *  - auto-logout saat token expired (timer berdasarkan payload.exp)
 *  - peringatan saat sesi tinggal sedikit (default: 5 menit)
 *  - sinkronisasi multi-tab via event 'storage'
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [loading, setLoading] = useState(true);

  // Info sesi reaktif
  const [tokenExp, setTokenExp] = useState(() => decodeToken(getToken())?.exp || null);
  const [tokenIat, setTokenIat] = useState(() => decodeToken(getToken())?.iat || null);
  const [loginAt, setLoginAt] = useState(() => getLoginAt());
  const [remainingMs, setRemainingMs] = useState(() => getSessionRemainingMs());
  const [warned, setWarned] = useState(false);

  const expiryTimerRef = useRef(null);
  const tickRef = useRef(null);

  /* -------------------------------------------------- */
  /* Internal: clear semua state sesi                   */
  /* -------------------------------------------------- */
  const wipeSession = useCallback(() => {
    clearSession();
    setUser(null);
    setTokenExp(null);
    setTokenIat(null);
    setLoginAt(null);
    setRemainingMs(null);
    setWarned(false);
    if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current);
    if (tickRef.current) clearInterval(tickRef.current);
  }, []);

  /* -------------------------------------------------- */
  /* Internal: pasang timer auto-logout & ticker        */
  /* -------------------------------------------------- */
  const armSessionTimers = useCallback(() => {
    if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current);
    if (tickRef.current) clearInterval(tickRef.current);

    const remaining = getSessionRemainingMs();
    if (remaining === null) return;

    if (remaining <= 0) {
      // sudah expired
      wipeSession();
      return;
    }

    // hard timer untuk auto-logout pas exp
    expiryTimerRef.current = setTimeout(() => {
      wipeSession();
      // optional: reload supaya halaman terproteksi langsung redirect ke /login
      if (window.location.pathname !== '/' &&
          !window.location.pathname.startsWith('/login') &&
          !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login?expired=1';
      }
    }, remaining);

    // ticker per detik untuk update remainingMs di UI
    tickRef.current = setInterval(() => {
      const r = getSessionRemainingMs();
      setRemainingMs(r);
      // peringatan 5 menit
      if (r !== null && r > 0 && r <= 5 * 60 * 1000 && !warned) {
        setWarned(true);
      }
      if (r === null || r <= 0) {
        clearInterval(tickRef.current);
      }
    }, 1000);
  }, [warned, wipeSession]);

  /* -------------------------------------------------- */
  /* Mount: validasi token & pasang timer               */
  /* -------------------------------------------------- */
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    // langsung tolak kalau payload exp sudah lewat
    if (isSessionExpired(token)) {
      wipeSession();
      setLoading(false);
      return;
    }

    api.get('/auth/me')
      .then((res) => {
        const fresh = { type: res.data.data.type, ...res.data.data.user };
        setUser(fresh);
        localStorage.setItem('user', JSON.stringify(fresh));
        const payload = decodeToken(token);
        if (payload) {
          setTokenExp(payload.exp || null);
          setTokenIat(payload.iat || null);
        }
        armSessionTimers();
      })
      .catch(() => {
        wipeSession();
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* -------------------------------------------------- */
  /* Multi-tab sync: token diubah di tab lain           */
  /* -------------------------------------------------- */
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'token') {
        if (!e.newValue) {
          // logout di tab lain
          wipeSession();
        } else if (e.newValue !== e.oldValue) {
          // login/refresh di tab lain
          const fresh = getStoredUser();
          if (fresh) setUser(fresh);
          const payload = decodeToken(e.newValue);
          setTokenExp(payload?.exp || null);
          setTokenIat(payload?.iat || null);
          setLoginAt(getLoginAt());
          setRemainingMs(getSessionRemainingMs());
          setWarned(false);
          armSessionTimers();
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [armSessionTimers, wipeSession]);

  /* -------------------------------------------------- */
  /* Public API                                         */
  /* -------------------------------------------------- */
  const setSession = (token, u) => {
    saveSession(token, u);
    setUser(u);
    const payload = decodeToken(token);
    setTokenExp(payload?.exp || null);
    setTokenIat(payload?.iat || null);
    setLoginAt(Date.now());
    setRemainingMs(getSessionRemainingMs(token));
    setWarned(false);
    armSessionTimers();
    return u;
  };

  const loginWarga = async (email, password) => {
    const res = await api.post('/auth/warga/login', { email, password });
    const { token, user: u } = res.data.data;
    return setSession(token, u);
  };

  const loginAdmin = async (email, password) => {
    const res = await api.post('/auth/admin/login', { email, password });
    const { token, user: u } = res.data.data;
    return setSession(token, u);
  };

  const registerWarga = async (form) => {
    const res = await api.post('/auth/warga/register', form);
    const { token, user: u } = res.data.data;
    return setSession(token, u);
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      const fresh = { type: res.data.data.type, ...res.data.data.user };
      setUser(fresh);
      localStorage.setItem('user', JSON.stringify(fresh));
      return fresh;
    } catch (err) {
      // ignore
    }
  };

  const logout = () => {
    wipeSession();
  };

  /**
   * Cek sesi ke server (juga me-refresh remainingMs dari server, bukan client).
   * Berguna setelah perubahan password atau tab idle lama.
   */
  const checkSession = async () => {
    try {
      const res = await api.get('/auth/session');
      const data = res.data.data;
      setRemainingMs(data.remaining_ms);
      return data;
    } catch {
      wipeSession();
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{
      user, loading,
      // session info
      tokenExp, tokenIat, loginAt, remainingMs, warned,
      // actions
      loginWarga, loginAdmin, registerWarga, logout,
      refreshUser, setSession, checkSession,
      // computed
      isWarga: user?.type === 'warga',
      isAdmin: user?.type === 'admin',
      isAuthenticated: !!user && !isSessionExpired(),
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus di dalam <AuthProvider>');
  return ctx;
}
