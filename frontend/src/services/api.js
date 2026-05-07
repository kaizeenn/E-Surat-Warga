/**
 * Axios client.
 *  - Otomatis attach JWT token dari localStorage ke header Authorization.
 *  - Cek expiry token di sisi client; kalau sudah expired, langsung clear sesi
 *    dan jangan repotin server.
 *  - Auto-redirect ke /login saat dapat 401 dari halaman terproteksi.
 */
import axios from 'axios';
import { getToken, isSessionExpired, clearSession } from '../utils/session';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

const PUBLIC_PATHS = ['/', '/login', '/register'];

function isOnPublicPage() {
  const path = window.location.pathname;
  return PUBLIC_PATHS.some((p) => path === p || path.startsWith(p + '/'));
}

function redirectToLogin(reason = '') {
  if (isOnPublicPage()) return;
  const qs = reason ? `?${reason}=1` : '';
  window.location.href = `/login${qs}`;
}

// === Request interceptor ===
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    if (isSessionExpired(token)) {
      // Token sudah lewat masa berlaku — bersihkan, jangan kirim request.
      clearSession();
      redirectToLogin('expired');
      // Batalkan request via AbortController.
      const ctrl = new AbortController();
      ctrl.abort();
      return { ...config, signal: ctrl.signal };
    }
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// === Response interceptor ===
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      clearSession();
      redirectToLogin('expired');
    }
    return Promise.reject(err);
  }
);

export default api;
export { API_URL };
