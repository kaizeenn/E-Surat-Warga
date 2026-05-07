/**
 * Session helper — kelola token JWT di localStorage,
 * decode payload (exp/iat), hitung sisa waktu, sinkronisasi multi-tab.
 *
 * Catatan keamanan: localStorage rentan XSS. Untuk skripsi/demo ini cukup,
 * tapi di production sebaiknya pakai httpOnly cookie.
 */

const TOKEN_KEY = 'token';
const USER_KEY = 'user';
const LOGIN_AT_KEY = 'login_at';

/* ------------------------------------------------------------------ */
/* Storage primitives                                                  */
/* ------------------------------------------------------------------ */
export function saveSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(LOGIN_AT_KEY, String(Date.now()));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(LOGIN_AT_KEY);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getLoginAt() {
  const raw = localStorage.getItem(LOGIN_AT_KEY);
  return raw ? Number(raw) : null;
}

/* ------------------------------------------------------------------ */
/* JWT decoding (tanpa verifikasi tanda tangan — itu tugas server)     */
/* ------------------------------------------------------------------ */
function base64UrlDecode(str) {
  // base64url -> base64
  let s = str.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  try {
    const decoded = atob(s);
    // handle UTF-8
    return decodeURIComponent(
      decoded.split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  } catch {
    return null;
  }
}

export function decodeToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const json = base64UrlDecode(parts[1]);
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Sisa waktu sesi dalam milidetik.
 * Return: number (>=0) kalau valid, atau null kalau token tidak ada / tidak punya exp.
 */
export function getSessionRemainingMs(token = getToken()) {
  const payload = decodeToken(token);
  if (!payload || !payload.exp) return null;
  return payload.exp * 1000 - Date.now();
}

export function isSessionExpired(token = getToken()) {
  const remaining = getSessionRemainingMs(token);
  return remaining !== null && remaining <= 0;
}

/* ------------------------------------------------------------------ */
/* Format helpers (untuk UI)                                          */
/* ------------------------------------------------------------------ */
export function formatRemaining(ms) {
  if (ms === null || ms === undefined) return '-';
  if (ms <= 0) return 'kedaluwarsa';
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  if (days > 0) return `${days} hari ${hours} jam`;
  if (hours > 0) return `${hours} jam ${mins} menit`;
  if (mins > 0) return `${mins} menit ${secs} detik`;
  return `${secs} detik`;
}

export function formatDateTime(epochSec) {
  if (!epochSec) return '-';
  const d = new Date(epochSec * 1000);
  return d.toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}
