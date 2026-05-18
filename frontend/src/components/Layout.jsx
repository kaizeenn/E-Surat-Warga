import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Icon from './Icon';
import SessionBadge from './SessionBadge';

export default function Layout({ children, variant = 'warga', menuItems = [] }) {
  const { user, logout, warned, remainingMs } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const warnShownRef = useRef(false);
  const storageKey = `sidebar-collapsed-${variant}`;
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(storageKey) === 'true');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(storageKey, String(collapsed));
  }, [collapsed, storageKey]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (warned && !warnShownRef.current && remainingMs > 0) {
      warnShownRef.current = true;
      toast(
        'Sesi Anda akan berakhir dalam waktu kurang dari 5 menit. Simpan pekerjaan Anda dan login ulang setelah keluar.',
        { duration: 8000, icon: '⚠️' }
      );
    }
  }, [warned, remainingMs]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isAdmin = variant === 'admin';
  const theme = isAdmin
    ? {
        shell: 'from-slate-950 via-red-950 to-slate-950',
        orb: 'bg-admin-500/25',
        accent: 'bg-admin-500',
        active: 'bg-white text-admin-700 shadow-lg shadow-black/10',
        hover: 'hover:bg-white/10',
        badge: 'Panel Admin Desa',
        subtitle: 'Kelola permohonan dan arsip surat warga',
      }
    : {
        shell: 'from-slate-950 via-blue-950 to-slate-950',
        orb: 'bg-warga-500/25',
        accent: 'bg-warga-500',
        active: 'bg-white text-warga-700 shadow-lg shadow-black/10',
        hover: 'hover:bg-white/10',
        badge: 'Layanan Warga',
        subtitle: 'Ajukan dan pantau surat desa secara online',
      };

  const sidebarWidth = collapsed ? 'lg:w-24' : 'lg:w-72';
  const mainPadding = collapsed ? 'lg:pl-24' : 'lg:pl-72';

  const DesktopSidebar = (
    <aside className={`fixed inset-y-0 left-0 z-30 hidden flex-col overflow-hidden bg-gradient-to-br ${theme.shell} text-white transition-all duration-300 lg:flex ${sidebarWidth}`}>
      <div className={`pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full blur-3xl ${theme.orb}`} />
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-52 w-52 rounded-full bg-white/10 blur-3xl" />

      <div className={`relative border-b border-white/10 ${collapsed ? 'p-4' : 'p-6'}`}>
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between gap-3'}`}>
          <Brand collapsed={collapsed} isAdmin={isAdmin} theme={theme} />
          {!collapsed && (
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-white/70 transition hover:bg-white/15 hover:text-white"
              title="Minimize sidebar"
            >
              <Icon name="arrowLeft" className="h-5 w-5" />
            </button>
          )}
        </div>

        {collapsed ? (
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            className="mt-4 flex h-10 w-full items-center justify-center rounded-2xl bg-white/10 text-white/75 transition hover:bg-white/15 hover:text-white"
            title="Buka sidebar"
          >
            <Icon name="arrowRight" className="h-5 w-5" />
          </button>
        ) : (
          <p className="mt-4 text-sm leading-relaxed text-white/60">{theme.subtitle}</p>
        )}
      </div>

      <nav className={`relative flex-1 space-y-1 ${collapsed ? 'p-3' : 'p-4'}`}>
        {menuItems.map((item) => (
          <MenuLink key={item.to} item={item} collapsed={collapsed} theme={theme} pathname={location.pathname} />
        ))}
      </nav>

      <div className={`relative border-t border-white/10 ${collapsed ? 'p-3' : 'p-4'}`}>
        <UserCard user={user} collapsed={collapsed} />
        {!collapsed && <SessionBadge variant="sidebar" />}
        <button
          onClick={handleLogout}
          title={collapsed ? 'Keluar' : undefined}
          className={`mt-2 flex w-full items-center rounded-2xl text-sm font-semibold text-white/75 transition-all hover:bg-white/10 hover:text-white ${
            collapsed ? 'justify-center px-3 py-3' : 'gap-3 px-4 py-3'
          }`}
        >
          <Icon name="logout" className="h-5 w-5" />
          {!collapsed && 'Keluar'}
        </button>
      </div>
    </aside>
  );

  const MobileTopbar = (
    <header className={`sticky top-0 z-40 border-b border-white/10 bg-gradient-to-br ${theme.shell} text-white shadow-xl shadow-slate-900/10 lg:hidden`}>
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <Brand collapsed={false} isAdmin={isAdmin} theme={theme} compact />
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white transition hover:bg-white/15"
          aria-label="Buka menu"
        >
          <Icon name="list" className="h-6 w-6" />
        </button>
      </div>
    </header>
  );

  const MobileDrawer = (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm transition-opacity lg:hidden ${mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={() => setMobileOpen(false)}
      />
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[86vw] max-w-80 flex-col overflow-hidden bg-gradient-to-br ${theme.shell} text-white shadow-2xl shadow-slate-950/30 transition-transform duration-300 lg:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className={`pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full blur-3xl ${theme.orb}`} />
        <div className="relative border-b border-white/10 p-5">
          <div className="flex items-center justify-between gap-3">
            <Brand collapsed={false} isAdmin={isAdmin} theme={theme} />
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-white/75 transition hover:bg-white/15 hover:text-white"
              aria-label="Tutup menu"
            >
              <Icon name="x" className="h-5 w-5" />
            </button>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-white/60">{theme.subtitle}</p>
        </div>

        <nav className="relative flex-1 space-y-1 overflow-y-auto p-4">
          {menuItems.map((item) => (
            <MenuLink key={item.to} item={item} collapsed={false} theme={theme} pathname={location.pathname} />
          ))}
        </nav>

        <div className="relative border-t border-white/10 p-4">
          <UserCard user={user} collapsed={false} />
          <SessionBadge variant="sidebar" />
          <button
            onClick={handleLogout}
            className="mt-2 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-white/75 transition-all hover:bg-white/10 hover:text-white"
          >
            <Icon name="logout" className="h-5 w-5" />
            Keluar
          </button>
        </div>
      </aside>
    </>
  );

  return (
    <div className="min-h-screen">
      {DesktopSidebar}
      {MobileTopbar}
      {MobileDrawer}

      <main className={`min-h-screen overflow-x-hidden transition-all duration-300 ${mainPadding}`}>
        <div className={`hidden h-1.5 lg:block ${theme.accent}`} />
        <div className="mx-auto max-w-7xl p-3 sm:p-4 md:p-6 xl:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

function Brand({ collapsed, isAdmin, theme, compact = false }) {
  return (
    <Link to={isAdmin ? '/admin' : '/warga'} className={`group flex min-w-0 items-center ${collapsed ? 'justify-center' : 'gap-3'}`} title="e-Surat Desa">
      <div className={`flex shrink-0 items-center justify-center rounded-2xl ${theme.accent} shadow-lg shadow-black/20 transition-transform group-hover:scale-105 ${compact ? 'h-10 w-10' : 'h-12 w-12'}`}>
        <Icon name="document" className={compact ? 'h-5 w-5' : 'h-6 w-6'} />
      </div>
      {!collapsed && (
        <div className="min-w-0">
          <h1 className={`${compact ? 'text-base' : 'text-xl'} truncate font-black tracking-tight`}>e-Surat Desa</h1>
          <p className="truncate text-xs font-medium text-white/60">{theme.badge}</p>
        </div>
      )}
    </Link>
  );
}

function MenuLink({ item, collapsed, theme, pathname }) {
  const active = pathname === item.to || (item.matchPrefix && pathname.startsWith(item.matchPrefix));
  return (
    <Link
      to={item.to}
      title={collapsed ? item.label : undefined}
      className={`group flex items-center rounded-2xl text-sm font-semibold transition-all ${
        collapsed ? 'justify-center px-3 py-3' : 'gap-3 px-4 py-3'
      } ${active ? theme.active : `text-white/75 ${theme.hover} hover:text-white`}`}
    >
      <Icon name={item.icon} className="h-5 w-5 shrink-0" />
      {!collapsed && <span>{item.label}</span>}
      {!collapsed && active && <span className={`ml-auto h-2 w-2 rounded-full ${theme.accent}`} />}
    </Link>
  );
}

function UserCard({ user, collapsed }) {
  return (
    <div className={`mb-3 rounded-3xl border border-white/10 bg-white/10 backdrop-blur ${collapsed ? 'p-2' : 'p-3'}`} title={collapsed ? user?.nama_lengkap : undefined}>
      <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/15 font-bold">
          {(user?.nama_lengkap || user?.email || '?').slice(0, 1).toUpperCase()}
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="truncate text-sm font-bold">{user?.nama_lengkap}</div>
            <div className="truncate text-xs text-white/55">{user?.email}</div>
          </div>
        )}
      </div>
    </div>
  );
}
