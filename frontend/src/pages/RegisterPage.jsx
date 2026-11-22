import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Button, ChipSelect, Field, Plates, Segmented } from '../components/ui.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import { ROUTES } from '../routes/paths.js';

export default function RegisterPage() {
  const { registerStudent, registerProfessor, user, loading } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [role, setRole] = useState(params.get('role') === 'professor' ? 'professor' : 'student');
  const [domains, setDomains] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    program: '',
    cgpa: '',
    department: '',
    domain_ids: [],
  });

  useEffect(() => {
    api.domains().then(setDomains).catch(() => setDomains([]));
  }, []);

  if (!loading && user) return <Navigate to={ROUTES.DASHBOARD} replace />;

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const toggleDomain = (id) =>
    setForm((prev) => ({
      ...prev,
      domain_ids: prev.domain_ids.includes(id) ? prev.domain_ids.filter((d) => d !== id) : [...prev.domain_ids, id],
    }));

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (role === 'student') {
        await registerStudent({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          program: form.program || null,
          cgpa: form.cgpa === '' ? null : Number(form.cgpa),
        });
      } else {
        await registerProfessor({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          department: form.department.trim(),
          domain_ids: form.domain_ids,
        });
      }
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  }

  const student = role === 'student';

  return (
    <div className="auth">
      <div className="auth-art">
        <p className="label kicker rise">Register · @giki.edu.pk only</p>
        <div className="rise" style={{ '--d': 80 }}>
          {student ? (
            <Plates>
              Join the
              <br />
              line-up.
            </Plates>
          ) : (
            <Plates>
              Supervise
              <br />
              the best.
            </Plates>
          )}
        </div>
        <p className="lead rise" style={{ '--d': 160 }}>
          {student
            ? 'Create your profile in minutes. Add your skills and target domains afterwards and the engine starts ranking teammates straight away.'
            : 'Register with your department and research domains. Your listing stays pending until an admin approves it, so students only ever see verified faculty.'}
        </p>
      </div>

      <form className="card form rise" style={{ '--d': 200 }} onSubmit={onSubmit}>
        <div className="section-head" style={{ marginBottom: 0 }}>
          <p className="label">01 — Pick a role</p>
          <Segmented
            label="Account type"
            value={role}
            onChange={setRole}
            options={[
              { value: 'student', label: 'Student' },
              { value: 'professor', label: 'Professor' },
            ]}
          />
        </div>

        <Field label="Full name">
          <input className="input" required autoComplete="name" value={form.name} onChange={(e) => update('name', e.target.value)} />
        </Field>
        <Field label="GIKI email">
          <input
            className="input"
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            placeholder="you@giki.edu.pk"
          />
        </Field>
        <Field label="Password · 6+ characters">
          <input
            className="input"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
          />
        </Field>

        {student ? (
          <div className="form-row">
            <Field label="Program">
              <input
                className="input"
                value={form.program}
                onChange={(e) => update('program', e.target.value)}
                placeholder="Computer Science"
              />
            </Field>
            <Field label="CGPA">
              <input
                className="input"
                type="number"
                min="0"
                max="4"
                step="0.01"
                value={form.cgpa}
                onChange={(e) => update('cgpa', e.target.value)}
                placeholder="3.50"
              />
            </Field>
          </div>
        ) : (
          <>
            <Field label="Department">
              <input
                className="input"
                required
                value={form.department}
                onChange={(e) => update('department', e.target.value)}
                placeholder="Faculty of Computer Science & Engineering"
              />
            </Field>
            <fieldset>
              <legend className="legend">Research domains</legend>
              <ChipSelect
                tone="blue"
                options={domains?.filter((d) => d.kind === 'research')}
                selected={form.domain_ids}
                onToggle={toggleDomain}
              />
            </fieldset>
          </>
        )}

        {error && (
          <p className="err" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" variant="solid" size="lg" block disabled={submitting}>
          {submitting ? 'Creating account…' : student ? 'Create student account' : 'Request faculty listing'}
        </Button>
        <p className="muted" style={{ fontSize: 15 }}>
          Already registered?{' '}
          <Link to={ROUTES.LOGIN} className="link">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
