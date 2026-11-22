import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button, ChipSelect, Field, PageHead, Rule, Segmented } from '../components/ui.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';

const EMPTY = { title: '', summary: '', team_size: 3, domain_ids: [], skill_ids: [] };
const toggleIn = (list, id) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

function ProjectForm({ initial, domains, onCancel, onSaved }) {
  const [form, setForm] = useState(initial ?? EMPTY);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const editing = Boolean(initial?.id);

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        title: form.title.trim(),
        summary: form.summary.trim(),
        team_size: Number(form.team_size),
        domain_ids: form.domain_ids,
        skill_ids: form.skill_ids,
      };
      if (editing) await api.updateProject(initial.id, payload);
      else await api.createProject(payload);
      await onSaved(editing ? 'Project updated.' : 'Project posted. Students can see it now.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="card form rise" onSubmit={onSubmit}>
      <p className="label">{editing ? 'Edit project' : 'Post a new project'}</p>
      <div className="form-row">
        <Field label="Title">
          <input
            className="input"
            required
            minLength={4}
            maxLength={160}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Crop disease detection from drone imagery"
          />
        </Field>
        <Field label="Team size">
          <select className="input" value={form.team_size} onChange={(e) => setForm({ ...form, team_size: e.target.value })}>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? 'student' : 'students'}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="What the project is about · 20+ characters">
        <textarea
          className="input"
          required
          minLength={20}
          maxLength={4000}
          rows={4}
          value={form.summary}
          onChange={(e) => setForm({ ...form, summary: e.target.value })}
          placeholder="The problem, what the group will build, and what a good outcome looks like."
        />
      </Field>
      <fieldset>
        <legend className="legend">Research domains</legend>
        <ChipSelect
          tone="blue"
          options={domains?.filter((d) => d.kind === 'research')}
          selected={form.domain_ids}
          onToggle={(id) => setForm((p) => ({ ...p, domain_ids: toggleIn(p.domain_ids, id) }))}
        />
      </fieldset>
      <fieldset>
        <legend className="legend">Skills you want in the group</legend>
        <ChipSelect
          options={domains?.filter((d) => d.kind === 'skill')}
          selected={form.skill_ids}
          onToggle={(id) => setForm((p) => ({ ...p, skill_ids: toggleIn(p.skill_ids, id) }))}
        />
      </fieldset>
      {error && (
        <p className="err" role="alert">
          {error}
        </p>
      )}
      <div className="row-act">
        <Button type="submit" variant="solid" disabled={saving}>
          {saving ? 'Saving…' : editing ? 'Save changes' : 'Post project'}
        </Button>
        <Button onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

export default function ProjectsPage() {
  const { user, professor, refresh } = useAuth();
  const [params] = useSearchParams();
  const isFaculty = user?.role === 'professor';
  const canPost = isFaculty && professor?.approval_status === 'APPROVED';

  const [view, setView] = useState(isFaculty ? 'mine' : 'all');
  const [search, setSearch] = useState(params.get('search') || '');
  const [domain, setDomain] = useState('');
  const [projects, setProjects] = useState(null);
  const [domains, setDomains] = useState(null);
  const [editing, setEditing] = useState(null); // null = closed, {} = new, project = edit
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busyId, setBusyId] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      setProjects(await api.projects({ search, domain, mine: view === 'mine' ? 'true' : '' }));
    } catch (err) {
      setError(err.message);
      setProjects([]);
    }
  }, [search, domain, view]);

  useEffect(() => {
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
  }, [load]);

  useEffect(() => {
    if (canPost) api.domains().then(setDomains).catch(() => setDomains([]));
  }, [canPost]);

  async function afterSave(message) {
    setEditing(null);
    setNotice(message);
    setView('mine');
    await Promise.all([load(), refresh()]);
  }

  async function act(project, fn) {
    setBusyId(project.id);
    setNotice('');
    try {
      await fn();
      await Promise.all([load(), refresh()]);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId('');
    }
  }

  const toEditForm = (p) => ({
    id: p.id,
    title: p.title,
    summary: p.summary,
    team_size: p.team_size,
    domain_ids: p.domains.map((d) => d.id),
    skill_ids: p.skills.map((d) => d.id),
  });

  return (
    <>
      <PageHead label="03 — Projects" title="On offer.">
        {isFaculty
          ? 'Post the FYP projects you want to supervise. Students see every open project from approved faculty and can reach out directly.'
          : 'FYP projects faculty are offering right now. Find one that fits your group and contact the supervisor.'}
      </PageHead>

      {isFaculty && !canPost && (
        <p className="empty rise" style={{ marginBottom: 32 }}>
          You can post projects once an admin approves your faculty account.
        </p>
      )}

      {canPost && (
        <section style={{ marginBottom: 'clamp(32px, 4vw, 56px)' }}>
          {editing ? (
            <ProjectForm
              key={editing.id || 'new'}
              initial={editing.id ? editing : null}
              domains={domains}
              onCancel={() => setEditing(null)}
              onSaved={afterSave}
            />
          ) : (
            <div className="card card-pink callout rise">
              <div>
                <p className="label">Supervising this year?</p>
                <p className="h3" style={{ marginTop: 8 }}>
                  Post a project and let strong groups come to you.
                </p>
              </div>
              <Button variant="solid" onClick={() => {
                  setNotice('');
                  setEditing({});
                }}>
                Post a project
              </Button>
            </div>
          )}
        </section>
      )}

      <div className="section-head rise" style={{ '--d': 140 }}>
        {isFaculty ? (
          <Segmented
            label="Which projects"
            value={view}
            onChange={setView}
            options={[
              { value: 'mine', label: 'My projects' },
              { value: 'all', label: 'All open' },
            ]}
          />
        ) : (
          <span />
        )}
        <p className="label" aria-live="polite">
          {projects ? `${projects.length} ${projects.length === 1 ? 'project' : 'projects'}` : 'Loading…'}
        </p>
      </div>

      <div className="filters rise" style={{ '--d': 180, gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
        <Field label="Search">
          <input className="input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Title, topic or faculty name" />
        </Field>
        <Field label="Domain or skill">
          <input className="input" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="e.g. Computer Vision" />
        </Field>
      </div>

      <section className="section">
        <Rule />
        {notice && (
          <p className="ok" role="status" style={{ marginBottom: 20 }}>
            {notice}
          </p>
        )}
        {error && <p className="err">{error}</p>}
        {projects === null && <p className="loading">Loading projects</p>}
        {projects?.length === 0 && !error && (
          <p className="empty">
            {view === 'mine' ? 'You have not posted any projects yet.' : 'No open projects match these filters.'}
          </p>
        )}
        {projects?.length > 0 && (
          <ul className="grid-3" key={view}>
            {projects.map((p, i) => {
              const owner = isFaculty && professor?.id === p.professor.id;
              return (
                <ProjectCard
                  key={p.id}
                  project={p}
                  index={i}
                  owner={owner}
                  busy={busyId === p.id}
                  onEdit={(proj) => {
                    setNotice('');
                    setEditing(toEditForm(proj));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onToggle={(proj) =>
                    act(proj, () => api.updateProject(proj.id, { status: proj.status === 'OPEN' ? 'CLOSED' : 'OPEN' }))
                  }
                  onDelete={(proj) => {
                    if (window.confirm(`Delete “${proj.title}”? This cannot be undone.`)) act(proj, () => api.deleteProject(proj.id));
                  }}
                />
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
