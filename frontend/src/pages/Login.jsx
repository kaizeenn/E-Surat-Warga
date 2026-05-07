import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Icon from '../components/Icon';

/**
 * Login warga + admin (dipilih via prop variant).
 */
export default function Login({ variant = 'warga' }) {
  const { loginWarga, loginAdmin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const isAdmin = variant === 'admin';
  const accent = isAdmin ? 'admin' : 'warga';

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

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-50 to-${accent}-50`}>
      <div className="card max-w-md w-full">
        <div className="text-center mb-6">
          <div className={`inline-flex items-center justify-center w-14 h-14 bg-${accent}-100 rounded-full mb-3`}>
            <Icon name={isAdmin ? 'shield' : 'user'} className={`w-7 h-7 text-${accent}-600`} />
          </div>
          <h1 className="text-2xl font-bold">
            {isAdmin ? 'Login Admin' : 'Login Warga'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Masuk ke akun {isAdmin ? 'admin RT/RW' : 'warga'} Anda
          </p>
        </div>

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
            className={isAdmin ? 'btn-danger w-full' : 'btn-primary w-full'}
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-slate-500 space-y-1">
          {!isAdmin && (
            <p>
              Belum punya akun?{' '}
              <Link to="/register" className="text-warga-600 hover:underline font-medium">
                Daftar
              </Link>
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
