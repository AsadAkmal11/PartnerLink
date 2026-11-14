import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { UserPlus } from 'lucide-react';
import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import { fadeUp } from '../lib/motion.js';
import { ROUTES } from '../routes/paths.js';

export default function RegisterPage() {
  const { registerStudent, registerProfessor, user, loading } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('student');
  const [domains, setDomains] = useState([]);
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

  if (!loading && user) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleDomain(id) {
    setForm((prev) => ({
      ...prev,
      domain_ids: prev.domain_ids.includes(id)
        ? prev.domain_ids.filter((d) => d !== id)
        : [...prev.domain_ids, id],
    }));
  }

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

  return (
    <div className="relative flex min-h-[calc(100vh-8rem)] items-center justify-center px-5 py-16">
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="w-full max-w-xl">
        <Card elevated className="p-8">
          <h1 className="font-display text-2xl font-bold tracking-tight">Join PartnerLink</h1>
          <p className="mt-2 text-sm text-text-secondary">
            GIKI emails only (@giki.edu.pk). Professors stay pending until an admin approves them.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl border border-border bg-background p-1">
            {['student', 'professor'].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRole(value)}
                className={`rounded-lg px-3 py-2 text-sm font-medium capitalize transition-colors ${
                  role === value ? 'bg-primary text-on-primary' : 'text-text-muted hover:text-text'
                }`}
              >
                {value}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <label className="block text-sm">
              <span className="mb-1.5 block text-text-muted">Full name</span>
              <input
                required
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 outline-none focus:border-primary"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block text-text-muted">GIKI email</span>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="you@giki.edu.pk"
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 outline-none focus:border-primary"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block text-text-muted">Password</span>
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 outline-none focus:border-primary"
              />
            </label>

            {role === 'student' ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="mb-1.5 block text-text-muted">Program</span>
                  <input
                    value={form.program}
                    onChange={(e) => update('program', e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 outline-none focus:border-primary"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1.5 block text-text-muted">CGPA</span>
                  <input
                    type="number"
                    min="0"
                    max="4"
                    step="0.01"
                    value={form.cgpa}
                    onChange={(e) => update('cgpa', e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 outline-none focus:border-primary"
                  />
                </label>
              </div>
            ) : (
              <>
                <label className="block text-sm">
                  <span className="mb-1.5 block text-text-muted">Department</span>
                  <input
                    required
                    value={form.department}
                    onChange={(e) => update('department', e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 outline-none focus:border-primary"
                  />
                </label>
                <fieldset>
                  <legend className="mb-2 text-sm text-text-muted">Research domains</legend>
                  <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto rounded-xl border border-border p-3">
                    {domains
                      .filter((d) => d.kind === 'research')
                      .map((d) => {
                        const active = form.domain_ids.includes(d.id);
                        return (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => toggleDomain(d.id)}
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              active
                                ? 'bg-primary text-on-primary'
                                : 'border border-border text-text-secondary hover:border-primary/50'
                            }`}
                          >
                            {d.name}
                          </button>
                        );
                      })}
                  </div>
                </fieldset>
              </>
            )}

            {error && <p className="text-sm text-error">{error}</p>}
            <Button type="submit" className="w-full" icon={UserPlus} disabled={submitting}>
              {submitting ? 'Creating account…' : 'Create account'}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-text-muted">
            Already registered?{' '}
            <Link to={ROUTES.LOGIN} className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
