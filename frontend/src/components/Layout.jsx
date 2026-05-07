import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Icon from './Icon';

/**
 * Layout dasar dengan sidebar navigasi.
 * variant: 'warga' | 'admin'
 */
export default function Layout({ children, variant = 'warga', menuItems = [] }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const accentClass = variant === 'admin' ? 'bg-admin-600' : 'bg-warga-600';
  const sidebarClass = variant === 'admin' ? 'bg-admin-700' : 'bg-warga-700';

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className={`w-64 ${sidebarClass} text-white flex flex-col`}>
        <div className="p-6 border-b border-white/10">
          <h1 className="font-bold text-lg leading-tight">e-Surat Desa</h1>
          <p className="text-xs text-white/70 mt-1">
            {variant === 'admin' ? 'Panel Admin' : 'Layanan Warga'}
          </p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {menuItems.map((item) => {
            const active = location.pathname === item.to ||
              (item.matchPrefix && location.pathname.startsWith(item.matchPrefix));
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active ? 'bg-white/20 font-semibold' : 'hover:bg-white/10'
                }`}
              >
                <Icon name={item.icon} className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/10">
          <div className="px-3 py-2 text-sm">
            <div className="font-medium truncate">{user?.nama_lengkap}</div>
            <div className="text-white/60 text-xs truncate">{user?.email}</div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-white/10 transition-colors"
          >
            <Icon name="logout" className="w-5 h-5" />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-x-hidden">
        <div className={`${accentClass} h-1`} />
        <div className="p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
