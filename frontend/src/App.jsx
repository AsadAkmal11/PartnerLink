import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell, ProtectedRoute, SiteLayout } from './components/layout.jsx';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import DiscoveryPage from './pages/DiscoveryPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import AdminApprovalsPage from './pages/AdminApprovalsPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import { ROUTES } from './routes/paths.js';
import { Film } from './components/ui.jsx';

export default function App() {
  return (
    <>
    <Film />
    <Routes>
      {/* The landing page carries its own masthead, footer and title-card intro. */}
      <Route path={ROUTES.HOME} element={<LandingPage />} />

      <Route element={<SiteLayout />}>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="discovery" element={<DiscoveryPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route
          path="admin"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminApprovalsPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      </Route>
    </Routes>
    </>
  );
}
