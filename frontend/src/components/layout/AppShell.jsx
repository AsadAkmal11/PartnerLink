import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Compass, LayoutDashboard, LogOut, ShieldCheck, UserRound } from 'lucide-react';
import Logo from '../common/Logo.jsx';
import Button from '../common/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROUTES } from '../../routes/paths.js';

function linkClass({ isActive }) {
  return [
    'rounded-xl px-3 py-2 text-sm font-medium transition-colors',
    isActive ? 'bg-primary/15 text-text' : 'text-text-muted hover:bg-surface-elevated hover:text-text',
  ].join(' ');
}

export default function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links = [
    { to: ROUTES.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard, end: true },
    ...(user?.role === 'student' || user?.role === 'admin'
      ? [{ to: ROUTES.DISCOVERY, label: 'Discovery', icon: Compass }]
      : []),
    { to: ROUTES.PROFILE, label: 'Profile', icon: UserRound },
    ...(user?.role === 'admin' ? [{ to: ROUTES.ADMIN, label: 'Approvals', icon: ShieldCheck }] : []),
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <header className="sticky top-0 z-40 border-b border-border glass-solid">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
          <NavLink to={ROUTES.HOME} className="rounded-lg">
            <Logo />
          </NavLink>
          <nav className="hidden items-center gap-1 md:flex">
            {links.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} className={linkClass}>
                <span className="inline-flex items-center gap-2">
                  <Icon size={16} aria-hidden="true" />
                  {label}
                </span>
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-text-muted sm:inline">
              {user?.name} · <span className="capitalize text-primary">{user?.role}</span>
            </span>
            <Button
              variant="ghost"
              size="sm"
              icon={LogOut}
              onClick={() => {
                logout();
                navigate(ROUTES.HOME);
              }}
            >
              Log out
            </Button>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto border-t border-border px-3 py-2 md:hidden">
          {links.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end} className={linkClass}>
              {label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-8 sm:px-8">
        <Outlet />
      </main>
    </div>
  );
}
