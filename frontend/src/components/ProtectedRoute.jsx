import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Pembungkus route. role = 'warga' | 'admin' | undefined (any logged-in)
 */
export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-500">Memuat...</div>
      </div>
    );
  }

  if (!user) {
    const to = role === 'admin' ? '/admin/login' : '/login';
    return <Navigate to={to} state={{ from: location }} replace />;
  }

  if (role && user.type !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}
