import { useEffect, useState } from 'react';
import { Button, ChipSelect, Field, PageHead } from '../components/ui.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';

const toggleIn = (list, id) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

function Status({ error, message }) {
  if (error)
    return (
      <p className="err" role="alert">
        {error}
      </p>
    );
  if (message)
    return (
      <p className="ok" role="status">
        {message}
      </p>
    );
  return null;
}

function Block({ label, no, children }) {
  return (
    <section className="cel">
      <span className="cel-tl hud">{label}</span>
      <span className="cel-no hud">Pass {no}</span>
      {children}
    </section>
  );
}

function StudentProfileForm({ student, onSaved }) {
  const [domains, setDomains] = useState(null);
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
      setMessage('Profile saved. Matches are being re-ranked.');
      await onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const skills = domains?.filter((d) => d.kind === 'skill');
  const research = domains?.filter((d) => d.kind === 'research');

  return (
    <form onSubmit={onSubmit} className="form" style={{ gap: 20 }}>
      <Block label="The basics" no="01">
        <div className="form">
          <div className="form-row">
            <Field label="Name">
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Program">
              <input className="input" value={form.program} onChange={(e) => setForm({ ...form, program: e.target.value })} />
            </Field>
            <Field label="CGPA">
              <input
                className="input"
                type="number"
                min="0"
                max="4"
                step="0.01"
                value={form.cgpa}
                onChange={(e) => setForm({ ...form, cgpa: e.target.value })}
              />
            </Field>
            <Field label="Primary research domain">
              <select
                className="input"
                value={form.primary_domain_id}
                onChange={(e) => setForm({ ...form, primary_domain_id: e.target.value })}
              >
                <option value="">None</option>
                {research?.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Bio · one line about what you want to build">
            <textarea className="input" rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          </Field>
        </div>
      </Block>

      <Block label="Skills you already have" no="02">
        <ChipSelect
          options={skills}
          selected={form.skill_ids}
          onToggle={(id) => setForm((p) => ({ ...p, skill_ids: toggleIn(p.skill_ids, id) }))}
        />
      </Block>

      <Block label="Domains you want to chase" no="03">
        <ChipSelect
          tone="cyan"
          options={research}
          selected={form.desired_domain_ids}
          onToggle={(id) => setForm((p) => ({ ...p, desired_domain_ids: toggleIn(p.desired_domain_ids, id) }))}
        />
      </Block>

      <div className="callout">
        <Status error={error} message={message} />
        <Button type="submit" variant="hot" size="lg" disabled={saving}>
          {saving ? 'Saving…' : 'Save profile'}
        </Button>
      </div>
    </form>
  );
}

function ProfessorProfileForm({ professor, onSaved }) {
  const [domains, setDomains] = useState(null);
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
    <form onSubmit={onSubmit} className="form" style={{ gap: 20 }}>
      <Block label="The basics" no="01">
        <div className="form">
          <div className="form-row">
            <Field label="Name">
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Department">
              <input
                className="input"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Bio · your research in a line">
            <textarea className="input" rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          </Field>
        </div>
      </Block>
      <Block label="Research domains" no="02">
        <ChipSelect
          tone="cyan"
          options={domains}
          selected={form.domain_ids}
          onToggle={(id) => setForm((p) => ({ ...p, domain_ids: toggleIn(p.domain_ids, id) }))}
        />
      </Block>
      <div className="callout">
        <Status error={error} message={message} />
        <Button type="submit" variant="hot" size="lg" disabled={saving}>
          {saving ? 'Saving…' : 'Save profile'}
        </Button>
      </div>
    </form>
  );
}

export default function ProfilePage() {
  const { user, student, professor, refresh } = useAuth();

  return (
    <>
      <PageHead scene={4} meta="Profile" script="your model sheet" title="Your sheet.">
        {user?.email} · <span style={{ textTransform: 'capitalize' }}>{user?.role}</span>
      </PageHead>
      <div className="rise" style={{ '--d': 360, maxWidth: 1080 }}>
        {user?.role === 'student' && <StudentProfileForm student={student} onSaved={refresh} />}
        {user?.role === 'professor' && <ProfessorProfileForm professor={professor} onSaved={refresh} />}
        {user?.role === 'admin' && (
          <p className="empty">Admin accounts manage faculty approvals. Use the Approvals desk to review pending professors.</p>
        )}
      </div>
    </>
  );
}
