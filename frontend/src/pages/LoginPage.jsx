import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { LogIn } from 'lucide-react';
import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { fadeUp } from '../lib/motion.js';
import { ROUTES } from '../routes/paths.js';

export default function LoginPage() {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) {
    return <Navigate to={location.state?.from || ROUTES.DASHBOARD} replace />;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate(location.state?.from || ROUTES.DASHBOARD);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-[calc(100vh-8rem)] items-center justify-center px-5 py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-70"
        style={{
          background:
            'radial-gradient(ellipse at top, color-mix(in oklab, var(--color-primary) 18%, transparent), transparent 55%)',
        }}
      />
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="w-full max-w-md">
        <Card elevated className="p-8">
          <div className="mb-6">
            <h1 className="font-display text-2xl font-bold tracking-tight">Welcome back</h1>
            <p className="mt-2 text-sm text-text-secondary">
              Sign in with your GIKI account to continue matching.
            </p>
          </div>
          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block text-sm">
              <span className="mb-1.5 block text-text-muted">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-text outline-none focus:border-primary"
                placeholder="you@giki.edu.pk"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block text-text-muted">Password</span>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-text outline-none focus:border-primary"
              />
            </label>
            {error && <p className="text-sm text-error">{error}</p>}
            <Button type="submit" className="w-full" icon={LogIn} disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
          <p className="mt-5 text-center text-sm text-text-muted">
            New here?{' '}
            <Link to={ROUTES.REGISTER} className="font-medium text-primary hover:underline">
              Create an account
            </Link>
          </p>
          <p className="mt-3 text-center text-xs text-text-muted">
            Demo: admin@giki.edu.pk / admin123 · aria.noor@giki.edu.pk / student123
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
