import { useEffect, useState } from 'react';
import { Field, PageHead, PersonCard, Segmented } from '../components/ui.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import { ROUTES } from '../routes/paths.js';

export default function DiscoveryPage() {
  const { user, professor } = useAuth();
  const isFaculty = user?.role === 'professor';
  const pendingFaculty = isFaculty && professor?.approval_status !== 'APPROVED';
  const [tab, setTab] = useState(pendingFaculty ? 'faculty' : 'students');
  const [search, setSearch] = useState('');
  const [skill, setSkill] = useState('');
  const [domain, setDomain] = useState('');
  const [students, setStudents] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        if (tab === 'students') {
          if (pendingFaculty) {
            if (!cancelled) setStudents([]);
            return;
          }
          const data = await api.students({ search, skill, domain });
          if (!cancelled) setStudents(data);
        } else {
          const data = await api.professors({ search, domain });
          if (!cancelled) setProfessors(data);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    const timer = setTimeout(load, 200);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [tab, search, skill, domain, pendingFaculty]);

  const list = tab === 'students' ? students : professors;

  return (
    <>
      <PageHead scene={2} meta="Discovery" script="who is out there" title="The directory.">
        {isFaculty
          ? 'Browse GIKI students by skill and research interest, and reach out to the ones you want on your projects.'
          : 'Filter GIKI peers by skill and research domain, or find an approved faculty supervisor and the projects they are offering.'}
      </PageHead>

      <div className="section-head rise" style={{ '--d': 140 }}>
        <Segmented
          label="Directory"
          value={tab}
          onChange={setTab}
          options={[
            { value: 'students', label: 'Students' },
            { value: 'faculty', label: 'Faculty' },
          ]}
        />
        <p className="hud" aria-live="polite">
          {loading ? 'Searching…' : `${list.length} ${tab === 'students' ? 'students' : 'professors'}`}
        </p>
      </div>

      <div className="filters rise" style={{ '--d': 180 }}>
        <Field label="Search">
          <input className="input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name or program" />
        </Field>
        {tab === 'students' && (
          <Field label="Skill">
            <input className="input" value={skill} onChange={(e) => setSkill(e.target.value)} placeholder="e.g. PyTorch" />
          </Field>
        )}
        <Field label="Research domain">
          <input className="input" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="e.g. Robotics" />
        </Field>
      </div>

      <section className="section">
        {error && <p className="err">{error}</p>}
        {tab === 'students' && pendingFaculty && (
          <p className="empty">You can browse student profiles once an admin approves your faculty account.</p>
        )}
        {!loading && !error && list.length === 0 && !(tab === 'students' && pendingFaculty) && (
          <p className="empty">
            {tab === 'students' ? 'No students match these filters.' : 'No approved faculty match these filters.'}
          </p>
        )}
        <ul className="grid-3" key={tab}>
          {tab === 'students'
            ? students.map((s, i) => (
                <PersonCard
                  key={s.id}
                  index={i}
                  name={s.name}
                  role={s.program || s.email}
                  bio={s.bio}
                  tags={s.skills.slice(0, 4).map((x) => x.name)}
                  domains={s.desired_domains.slice(0, 2).map((d) => d.name)}
                  foot={
                    <>
                      <span>{s.cgpa != null ? `CGPA ${s.cgpa.toFixed(2)}` : 'CGPA —'}</span>
                      <a
                        className="link"
                        href={`mailto:${s.email}${isFaculty ? `?subject=${encodeURIComponent('FYP project opportunity')}` : ''}`}
                      >
                        {isFaculty ? 'Invite to project' : 'Say hello'}
                      </a>
                    </>
                  }
                />
              ))
            : professors.map((p, i) => (
                <PersonCard
                  key={p.id}
                  index={i}
                  name={p.name}
                  role={p.department}
                  bio={p.bio}
                  domains={p.domains.map((d) => d.name)}
                  projects={p.projects}
                  projectsLink={`${ROUTES.PROJECTS}?search=${encodeURIComponent(p.name)}`}
                  foot={
                    <>
                      <span>Approved faculty</span>
                      <a className="link" href={`mailto:${p.email}`}>
                        Contact
                      </a>
                    </>
                  }
                />
              ))}
        </ul>
      </section>
    </>
  );
}
