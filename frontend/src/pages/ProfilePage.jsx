import { useEffect, useState } from 'react';
import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';

function ChipSelect({ options, selected, onToggle }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = selected.includes(opt.id);
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onToggle(opt.id)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              active ? 'bg-primary text-on-primary' : 'border border-border text-text-secondary'
            }`}
          >
            {opt.name}
          </button>
        );
      })}
    </div>
  );
}

function StudentProfileForm({ student, onSaved }) {
  const [domains, setDomains] = useState([]);
  const [form, setForm] = useState({
    name: student?.name || '',
    program: student?.program || '',
    cgpa: student?.cgpa ?? '',
    bio: student?.bio || '',
    primary_domain_id: student?.primary_domain?.id || '',
    skill_ids: student?.skills?.map((s) => s.id) || [],
    desired_domain_ids: student?.desired_domains?.map((d) => d.id) || [],
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.domains().then(setDomains).catch(() => setDomains([]));
  }, []);

  function toggle(field, id) {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(id) ? prev[field].filter((x) => x !== id) : [...prev[field], id],
    }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await api.updateStudentProfile({
        name: form.name,
        program: form.program || null,
        cgpa: form.cgpa === '' ? null : Number(form.cgpa),
        bio: form.bio || null,
        primary_domain_id: form.primary_domain_id || null,
        skill_ids: form.skill_ids,
        desired_domain_ids: form.desired_domain_ids,
      });
      setMessage('Profile saved. Matches will refresh.');
      await onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const skills = domains.filter((d) => d.kind === 'skill');
  const research = domains.filter((d) => d.kind === 'research');

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1.5 block text-text-muted">Name</span>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 outline-none focus:border-primary"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-text-muted">Program</span>
          <input
            value={form.program}
            onChange={(e) => setForm({ ...form, program: e.target.value })}
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
            onChange={(e) => setForm({ ...form, cgpa: e.target.value })}
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 outline-none focus:border-primary"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-text-muted">Primary research domain</span>
          <select
            value={form.primary_domain_id}
            onChange={(e) => setForm({ ...form, primary_domain_id: e.target.value })}
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 outline-none focus:border-primary"
          >
            <option value="">None</option>
            {research.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="block text-sm">
        <span className="mb-1.5 block text-text-muted">Bio</span>
        <textarea
          rows={3}
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          className="w-full rounded-xl border border-border bg-background px-3 py-2.5 outline-none focus:border-primary"
        />
      </label>
      <div>
        <p className="mb-2 text-sm text-text-muted">Skills</p>
        <ChipSelect options={skills} selected={form.skill_ids} onToggle={(id) => toggle('skill_ids', id)} />
      </div>
      <div>
        <p className="mb-2 text-sm text-text-muted">Desired FYP domains</p>
        <ChipSelect
          options={research}
          selected={form.desired_domain_ids}
          onToggle={(id) => toggle('desired_domain_ids', id)}
        />
      </div>
      {error && <p className="text-sm text-error">{error}</p>}
      {message && <p className="text-sm text-success">{message}</p>}
      <Button type="submit" disabled={saving}>
        {saving ? 'Saving…' : 'Save profile'}
      </Button>
    </form>
  );
}

function ProfessorProfileForm({ professor, onSaved }) {
  const [domains, setDomains] = useState([]);
  const [form, setForm] = useState({
    name: professor?.name || '',
    department: professor?.department || '',
    bio: professor?.bio || '',
    domain_ids: professor?.domains?.map((d) => d.id) || [],
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.domains('research').then(setDomains).catch(() => setDomains([]));
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await api.updateProfessorProfile({
        name: form.name,
        department: form.department,
        bio: form.bio || null,
        domain_ids: form.domain_ids,
      });
      setMessage('Faculty profile saved.');
      await onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1.5 block text-text-muted">Name</span>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 outline-none focus:border-primary"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-text-muted">Department</span>
          <input
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 outline-none focus:border-primary"
          />
        </label>
      </div>
      <label className="block text-sm">
        <span className="mb-1.5 block text-text-muted">Bio</span>
        <textarea
          rows={3}
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          className="w-full rounded-xl border border-border bg-background px-3 py-2.5 outline-none focus:border-primary"
        />
      </label>
      <div>
        <p className="mb-2 text-sm text-text-muted">Research domains</p>
        <ChipSelect
          options={domains}
          selected={form.domain_ids}
          onToggle={(id) =>
            setForm((prev) => ({
              ...prev,
              domain_ids: prev.domain_ids.includes(id)
                ? prev.domain_ids.filter((x) => x !== id)
                : [...prev.domain_ids, id],
            }))
          }
        />
      </div>
      {error && <p className="text-sm text-error">{error}</p>}
      {message && <p className="text-sm text-success">{message}</p>}
      <Button type="submit" disabled={saving}>
        {saving ? 'Saving…' : 'Save profile'}
      </Button>
    </form>
  );
}

export default function ProfilePage() {
  const { user, student, professor, refresh } = useAuth();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight">Profile</h1>
        <p className="mt-2 text-text-secondary">
          {user?.email} · <span className="capitalize">{user?.role}</span>
        </p>
      </header>
      <Card elevated className="p-6">
        {user?.role === 'student' && <StudentProfileForm student={student} onSaved={refresh} />}
        {user?.role === 'professor' && <ProfessorProfileForm professor={professor} onSaved={refresh} />}
        {user?.role === 'admin' && (
          <p className="text-sm text-text-secondary">
            Admin accounts manage faculty approvals. Use the Approvals panel to review pending professors.
          </p>
        )}
      </Card>
    </div>
  );
}
