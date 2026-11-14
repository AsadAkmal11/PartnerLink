import { useEffect, useState } from 'react';
import PersonCard from '../components/common/PersonCard.jsx';
import Card from '../components/common/Card.jsx';
import { api } from '../services/api.js';

export default function DiscoveryPage() {
  const [tab, setTab] = useState('students');
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
  }, [tab, search, skill, domain]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight">Discovery</h1>
        <p className="mt-2 text-text-secondary">
          Filter GIKI peers by skills and research domains, or find approved faculty supervisors.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {['students', 'faculty'].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={`rounded-full px-4 py-2 text-sm font-medium capitalize ${
              tab === value ? 'bg-primary text-on-primary' : 'border border-border text-text-muted'
            }`}
          >
            {value}
          </button>
        ))}
      </div>

      <Card className="grid gap-3 p-4 sm:grid-cols-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or program"
          className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
        />
        {tab === 'students' && (
          <input
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            placeholder="Filter by skill"
            className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
        )}
        <input
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="Filter by research domain"
          className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
        />
      </Card>

      {loading && <p className="text-sm text-text-muted">Loading…</p>}
      {error && <p className="text-sm text-error">{error}</p>}

      {tab === 'students' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {students.map((student) => (
            <PersonCard
              key={student.id}
              name={student.name}
              subtitle={student.program || student.email}
              tags={[
                ...student.skills.slice(0, 4).map((s) => s.name),
                ...student.desired_domains.slice(0, 2).map((d) => d.name),
              ]}
              footer={student.cgpa != null ? `CGPA ${student.cgpa.toFixed(2)}` : undefined}
            >
              {student.bio}
            </PersonCard>
          ))}
          {!loading && students.length === 0 && (
            <Card className="p-6 text-sm text-text-muted sm:col-span-2 lg:col-span-3">No students match these filters.</Card>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {professors.map((prof) => (
            <PersonCard
              key={prof.id}
              name={prof.name}
              subtitle={prof.department}
              tags={prof.domains.map((d) => d.name)}
            >
              {prof.bio}
            </PersonCard>
          ))}
          {!loading && professors.length === 0 && (
            <Card className="p-6 text-sm text-text-muted sm:col-span-2 lg:col-span-3">
              No approved faculty match these filters.
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
