import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Icon from '../components/Icon';

/**
 * Halaman login terpadu — warga & admin dipilih via tab.
 * Default tab dari query string ?as=admin atau ?as=warga.
 */
export default function Login() {
  const { loginWarga, loginAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Default role dari query string, fallback ke 'warga'
  const params = new URLSearchParams(location.search);
  const initialRole = params.get('as') === 'admin' ? 'admin' : 'warga';

  const [role, setRole] = useState(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const isAdmin = role === 'admin';
  const accent = isAdmin ? 'admin' : 'warga';

  const switchRole = (next) => {
    setRole(next);
    setEmail('');
    setPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fn = isAdmin ? loginAdmin : loginWarga;
      const u = await fn(email, password);
      toast.success(`Selamat datang, ${u.nama_lengkap}`);
      navigate(isAdmin ? '/admin' : '/warga');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  // class dynamic harus ditulis lengkap supaya kebaca tailwind safelist
  const bgClass = isAdmin
    ? 'bg-gradient-to-br from-slate-50 to-admin-50'
    : 'bg-gradient-to-br from-slate-50 to-warga-50';
  const iconBgClass = isAdmin ? 'bg-admin-100' : 'bg-warga-100';
  const iconColorClass = isAdmin ? 'text-admin-600' : 'text-warga-600';
  const submitBtnClass = isAdmin ? 'btn-admin-primary w-full' : 'btn-primary w-full';

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${bgClass}`}>
      <div className="card max-w-md w-full">
        {/* Tab role switcher */}
        <div className="flex gap-1 bg-slate-100 rounded-lg p-1 mb-6">
          <button
            type="button"
            onClick={() => switchRole('warga')}
            className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-center gap-2 ${
              !isAdmin ? 'bg-white shadow-sm font-semibold text-warga-700' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Icon name="user" className="w-4 h-4" />
            Warga
          </button>
          <button
            type="button"
            onClick={() => switchRole('admin')}
            className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-center gap-2 ${
              isAdmin ? 'bg-white shadow-sm font-semibold text-admin-700' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Icon name="shield" className="w-4 h-4" />
            Admin
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <div className={`inline-flex items-center justify-center w-14 h-14 ${iconBgClass} rounded-full mb-3`}>
            <Icon name={isAdmin ? 'shield' : 'user'} className={`w-7 h-7 ${iconColorClass}`} />
          </div>
          <h1 className="text-2xl font-bold">
            {isAdmin ? 'Login Admin' : 'Login Warga'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isAdmin
              ? 'Masuk ke panel admin RT/RW.'
              : 'Masuk untuk mengajukan surat keterangan.'}
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
              placeholder={isAdmin ? 'admin@rtrw.local' : 'email@example.com'}
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

          <button type="submit" disabled={loading} className={submitBtnClass}>
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-5 text-center text-sm text-slate-500 space-y-1">
          {!isAdmin ? (
            <p>
              Belum punya akun warga?{' '}
              <Link to="/register" className="text-warga-600 hover:underline font-medium">
                Daftar di sini
              </Link>
            </p>
          ) : (
            <p className="text-xs text-slate-400">
              Akun admin hanya dapat dibuat oleh pengurus RT/RW.
            </p>
          )}
          <p>
            <Link to="/" className="text-slate-500 hover:underline inline-flex items-center gap-1">
              <Icon name="arrowLeft" className="w-4 h-4" />
              Kembali ke beranda
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
