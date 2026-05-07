import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Icon from '../components/Icon';

/**
 * Login terpadu — sistem otomatis mendeteksi role (warga/admin)
 * berdasarkan email yang terdaftar di database.
 */
export default function Login() {
  const { setSession } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data.data;

      // Simpan session via AuthContext helper
      setSession(token, user);

      toast.success(`Selamat datang, ${user.nama_lengkap}`);

      // Arahkan sesuai role hasil deteksi backend
      navigate(user.type === 'admin' ? '/admin' : '/warga');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-50 to-warga-50">
      <div className="max-w-md w-full">
        <div className="mb-3">
          <Link to="/" className="inline-flex items-center text-sm text-slate-500 hover:text-warga-700">
            <Icon name="arrowLeft" className="w-4 h-4 mr-1.5" />
            Kembali ke beranda
          </Link>
        </div>
        <div className="card">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-warga-100 rounded-full mb-3">
            <Icon name="document" className="w-8 h-8 text-warga-600" />
          </div>
          <h1 className="text-2xl font-bold">e-Surat Desa</h1>
          <p className="text-sm text-slate-500 mt-1">
            Masuk ke akun Anda untuk melanjutkan.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="email@example.com"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-5 border-t border-slate-100 text-center text-sm text-slate-500">
          <p>
            Belum punya akun?{' '}
            <Link to="/register" className="text-warga-600 hover:underline font-medium">
              Daftar Akun Warga
            </Link>
          </p>
          <p className="mt-2 text-xs text-slate-400">
            Akun admin dibuat oleh pengurus desa/RT/RW.
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}
