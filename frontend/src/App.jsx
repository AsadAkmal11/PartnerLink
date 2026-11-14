import { Routes, Route, Navigate } from 'react-router-dom';
import RootLayout from './components/layout/RootLayout.jsx';
import AppShell from './components/layout/AppShell.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import DiscoveryPage from './pages/DiscoveryPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import AdminApprovalsPage from './pages/AdminApprovalsPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import { ROUTES } from './routes/paths.js';

export default function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path={ROUTES.HOME} element={<LandingPage />} />
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
        <Route
          path="discovery"
          element={
            <ProtectedRoute roles={['student', 'admin']}>
              <DiscoveryPage />
            </ProtectedRoute>
          }
        />
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
  );
}
