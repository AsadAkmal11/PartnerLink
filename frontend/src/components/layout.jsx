import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ROUTES } from '../routes/paths.js';
import { Button, Colophon, Crops, inkFor, initials } from './ui.jsx';

function Logo() {
  return (
    <Link to={ROUTES.HOME} className="logo" aria-label="PartnerLink home">
      PARTNERLINK<sup>’26</sup>
    </Link>
  );
}

const navClass = ({ isActive }) => (isActive ? 'active' : undefined);

/** Public pages: sign in, register, 404. */
export function SiteLayout() {
  const { user } = useAuth();
  return (
    <div className="shell">
      <a href="#main" className="skip">
        Skip to content
      </a>
      <Crops />
      <header className="top">
        <Logo />
        <nav className="nav" aria-label="Primary">
          <NavLink to={ROUTES.HOME} end className={navClass}>
            Home
          </NavLink>
          <NavLink to={ROUTES.LOGIN} className={navClass}>
            Sign in
          </NavLink>
          <NavLink to={ROUTES.REGISTER} className={navClass}>
            Register
          </NavLink>
        </nav>
        {user ? (
          <Button to={ROUTES.DASHBOARD} variant="solid">
            Open app
          </Button>
        ) : (
          <Button to={ROUTES.REGISTER} variant="solid">
            Get started
          </Button>
        )}
      </header>
      <main id="main">
        <Outlet />
      </main>
      <Colophon />
    </div>
  );
}

/** Signed-in workspace. */
export function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links = [
    { to: ROUTES.DASHBOARD, label: 'Dashboard', end: true },
    { to: ROUTES.DISCOVERY, label: 'Discovery' },
    { to: ROUTES.PROJECTS, label: 'Projects' },
    { to: ROUTES.PROFILE, label: 'Profile' },
    ...(user?.role === 'admin' ? [{ to: ROUTES.ADMIN, label: 'Approvals' }] : []),
  ];
  const navItems = links.map(({ to, label, end }) => (
    <NavLink key={to} to={to} end={end} className={navClass}>
      {label}
    </NavLink>
  ));

  return (
    <div className="shell">
      <a href="#main" className="skip">
        Skip to content
      </a>
      <Crops />
      <div>
        <header className="top">
          <Logo />
          <nav className="nav" aria-label="Workspace">
            {navItems}
          </nav>
          <div className="top-r">
            <span className="who">
              <span className="dot" style={{ '--c': inkFor(user?.name) }} aria-hidden="true">
                {initials(user?.name)}
              </span>
              <span className="who-name">
                <b>{user?.name}</b> · {user?.role}
              </span>
            </span>
            <Button
              size="sm"
              onClick={() => {
                logout();
                navigate(ROUTES.HOME);
              }}
            >
              Log out
            </Button>
          </div>
        </header>
        <nav className="subnav nav" aria-label="Workspace (compact)">
          {navItems}
        </nav>
      </div>
      <main id="main" className="page">
        <Outlet />
      </main>
      <Colophon right={user ? `Signed in as ${user.email}` : undefined} />
    </div>
  );
}

export function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="center-load">
        <p className="loading">Loading session</p>
      </div>
    );
  }
  if (!user) return <Navigate to={ROUTES.LOGIN} replace state={{ from: location.pathname }} />;
  if (roles && !roles.includes(user.role)) return <Navigate to={ROUTES.DASHBOARD} replace />;
  return children;
}
