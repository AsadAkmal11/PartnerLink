import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Button, Field, Mascot, Paint, Script } from '../components/ui.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { ROUTES } from '../routes/paths.js';

export default function LoginPage() {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) return <Navigate to={location.state?.from || ROUTES.DASHBOARD} replace />;

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate(location.state?.from || ROUTES.DASHBOARD);
    } catch (err) {
      setError(err.message || 'Sign in failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth">
      <div className="auth-art">
        <span className="hud rise">Sc. 00 — Sign in · GIKI accounts only</span>
        <Script text="good to see you" className="s-lg s-peach" seed={61} />
        <Paint size="t-page" d={120}>
          {'Welcome\nback.'}
        </Paint>
        <p className="lead rise" style={{ '--d': 300 }}>
          Your matches have been re-ranked since you left. Sign in to see who fits your team best.
        </p>
        <Mascot d={700} />
      </div>

      <form className="cel form rise" style={{ '--d': 200 }} onSubmit={onSubmit}>
        <span className="cel-tl hud">Your account</span>
        <span className="cel-no hud">Fr 0001</span>
        <Field label="GIKI email">
          <input
            className="input"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@giki.edu.pk"
          />
        </Field>
        <Field label="Password">
          <input
            className="input"
            type="password"
            required
            minLength={6}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        {error && (
          <p className="err" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" variant="hot" size="lg" block disabled={submitting} arrow={!submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </Button>
        <p className="muted" style={{ fontSize: 15 }}>
          New here?{' '}
          <Link to={ROUTES.REGISTER} className="link">
            Create an account
          </Link>
        </p>
        <div className="demo">
          <span>Demo accounts</span>
          <span>
            <b>admin@giki.edu.pk</b> / admin123
          </span>
          <span>
            <b>aria.noor@giki.edu.pk</b> / student123
          </span>
          <span>
            <b>faculty.a@giki.edu.pk</b> / prof123
          </span>
        </div>
      </form>
    </div>
  );
}
