import { useEffect, useState } from 'react';
import { Button, INKS, PageHead, PersonCard, Rule, Stamp } from '../components/ui.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import { ROUTES } from '../routes/paths.js';

const firstName = (n) => n?.split(' ')[0] || 'there';

function StudentDashboard({ student }) {
  const [recs, setRecs] = useState(null);
  const [error, setError] = useState('');
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    api
      .projects()
      .then(setOffers)
      .catch(() => setOffers([]));
  }, []);

  useEffect(() => {
    api
      .recommendations(9)
      .then(setRecs)
      .catch((err) => {
        setError(err.message);
        setRecs([]);
      });
  }, []);

  const needsProfile = !student?.skills?.length || !student?.desired_domains?.length || student?.cgpa == null;
  const best = recs?.[0]?.similarity_score;

  return (
    <>
      <PageHead label="01 — Student workspace" title={`Hi, ${firstName(student?.name)}.`}>
        Ranked teammates from skill overlap, shared research domains and CGPA fit. Scores refresh every time a
        profile changes.
      </PageHead>

      <div className="stats rise" style={{ '--d': 160 }}>
        <div className="stat">
          <span className="label">Matches</span>
          <b style={{ '--s': 'var(--pink)' }}>{recs ? recs.length : '—'}</b>
        </div>
        <div className="stat">
          <span className="label">Best fit</span>
          <b style={{ '--s': 'var(--blue)' }}>{best != null ? `${Math.round(best * 100)}%` : '—'}</b>
        </div>
        <div className="stat">
          <span className="label">Your skills</span>
          <b>{student?.skills?.length ?? 0}</b>
        </div>
        <div className="stat">
          <span className="label">CGPA</span>
          <b>{student?.cgpa != null ? student.cgpa.toFixed(2) : '—'}</b>
        </div>
      </div>

      {needsProfile && (
        <section className="section">
          <div className="card card-pink callout rise" style={{ '--d': 220 }}>
            <div>
              <p className="label">Profile incomplete</p>
              <p className="h3" style={{ marginTop: 8 }}>
                Add CGPA, skills and target domains to sharpen your matches.
              </p>
            </div>
            <Button to={ROUTES.PROFILE} variant="solid">
              Finish profile
            </Button>
          </div>
        </section>
      )}

      {recs?.length > 0 && (
        <section className="section">
          <Rule />
          <div className="section-head">
            <div>
              <p className="label">02 — Score ruler</p>
              <h2 className="h-display h2" style={{ marginTop: 12 }}>
                Who fits best
              </h2>
            </div>
          </div>
          <div className="ruler">
            {recs.slice(0, 6).map(({ student: peer, similarity_score }, i) => (
              <div className="bar" key={peer.id}>
                <span className="bar-name">{peer.name}</span>
                <span className="bar-track" aria-hidden="true">
                  <i className="bar-fill" style={{ '--w': `${Math.max(4, similarity_score * 100)}%`, '--c': INKS[i % INKS.length], '--n': i }} />
                </span>
                <span className="bar-v">{Math.round(similarity_score * 100)}%</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="section">
        <Rule />
        <div className="section-head">
          <div>
            <p className="label">03 — Recommendations</p>
            <h2 className="h-display h2" style={{ marginTop: 12 }}>
              Your top teammates
            </h2>
          </div>
          <Button to={ROUTES.DISCOVERY}>Browse directory</Button>
        </div>
        {recs === null && <p className="loading">Ranking your matches</p>}
        {error && <p className="err">{error}</p>}
        {recs && !error && recs.length === 0 && (
          <p className="empty">No recommendations yet. Update your profile and check back.</p>
        )}
        {recs?.length > 0 && (
          <ul className="grid-3">
            {recs.map(({ student: peer, similarity_score }, i) => (
              <PersonCard
                key={peer.id}
                index={i}
                name={peer.name}
                role={peer.program || peer.email}
                score={similarity_score}
                bio={peer.bio}
                tags={peer.skills.slice(0, 3).map((s) => s.name)}
                domains={peer.desired_domains.slice(0, 2).map((d) => d.name)}
                foot={
                  <>
                    <span>{peer.cgpa != null ? `CGPA ${peer.cgpa.toFixed(2)}` : 'CGPA —'}</span>
                    <a className="link" href={`mailto:${peer.email}`}>
                      Say hello
                    </a>
                  </>
                }
              />
            ))}
          </ul>
        )}
      </section>

      {offers.length > 0 && (
        <section className="section">
          <Rule />
          <div className="section-head">
            <div>
              <p className="label">04 — Projects on offer</p>
              <h2 className="h-display h2" style={{ marginTop: 12 }}>
                Supervisors want you
              </h2>
            </div>
            <Button to={ROUTES.PROJECTS}>All {offers.length} projects</Button>
          </div>
          <ul className="grid-3">
            {offers.slice(0, 3).map((p, i) => (
              <ProjectCard key={p.id} project={p} index={i} />
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

function ProfessorDashboard({ professor }) {
  const status = professor?.approval_status || 'PENDING';
  const open = (professor?.projects ?? []).filter((p) => p.status === 'OPEN');
  const copy = {
    PENDING: 'An admin will review your registration shortly. Until then, students cannot see your listing.',
    APPROVED: 'You are live in faculty discovery. Students looking for a supervisor in your domains can find you.',
    REJECTED: professor?.approval_note
      ? `Rejected: ${professor.approval_note}`
      : 'Your registration was rejected. Contact an admin if this is unexpected.',
  }[status];

  return (
    <>
      <PageHead label="01 — Faculty workspace" title={`Welcome, ${firstName(professor?.name)}.`}>
        Students only ever see approved faculty. Keep your research domains current so the right groups find you.
      </PageHead>
      <div className="grid-2">
        <div className="card rise" style={{ '--d': 160 }}>
          <div className="section-head">
            <p className="label">Approval status</p>
            <Stamp status={status} />
          </div>
          <p className="lead">{copy}</p>
        </div>
        <div className="card rise" style={{ '--d': 220 }}>
          <p className="label">Your research domains</p>
          <div className="tags" style={{ margin: '18px 0 24px' }}>
            {professor?.domains?.length ? (
              professor.domains.map((d) => (
                <span key={d.id} className="tag tag-domain">
                  {d.name}
                </span>
              ))
            ) : (
              <span className="muted">None added yet.</span>
            )}
          </div>
          <Button to={ROUTES.PROFILE} variant="solid">
            Update faculty profile
          </Button>
        </div>
      </div>

      <section className="section">
        <Rule />
        <div className="section-head">
          <div>
            <p className="label">02 — Your projects</p>
            <h2 className="h-display h2" style={{ marginTop: 12 }}>
              {open.length ? `${open.length} on offer` : 'Nothing on offer yet'}
            </h2>
          </div>
          <div className="row-act">
            {status === 'APPROVED' && <Button to={ROUTES.DISCOVERY}>Browse students</Button>}
            <Button to={ROUTES.PROJECTS} variant="solid">
              {status === 'APPROVED' ? 'Post a project' : 'View projects'}
            </Button>
          </div>
        </div>
        {status !== 'APPROVED' ? (
          <p className="empty">Once an admin approves you, you can post projects and browse student profiles.</p>
        ) : open.length === 0 ? (
          <p className="empty">Post the projects you want to supervise — they appear on your faculty card and the Projects page.</p>
        ) : (
          <ul className="grid-3">
            {open.map((p, i) => (
              <ProjectCard key={p.id} project={p} index={i} readonly />
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

function AdminDashboard() {
  const [pending, setPending] = useState(null);

  useEffect(() => {
    api
      .approvals('PENDING')
      .then(setPending)
      .catch(() => setPending([]));
  }, []);

  return (
    <>
      <PageHead label="01 — Admin workspace" title="Moderator desk.">
        Review faculty registrations and keep the directory trustworthy. Every decision is stored with who acted and
        when.
      </PageHead>
      <div className="grid-2">
        <div className="card card-pink rise" style={{ '--d': 160 }}>
          <p className="label">Pending faculty</p>
          <p className="h-display" style={{ fontSize: 'clamp(90px, 11vw, 180px)', margin: '14px 0 22px' }}>
            {pending ? pending.length : '—'}
          </p>
          <Button to={ROUTES.ADMIN} variant="solid">
            Open approvals
          </Button>
        </div>
        <div className="card rise" style={{ '--d': 220 }}>
          <p className="label">Directory</p>
          <p className="lead" style={{ margin: '14px 0 24px' }}>
            Browse every student and approved professor, with the same filters students use.
          </p>
          <div className="row-act">
            <Button to={ROUTES.DISCOVERY}>Browse discovery</Button>
            <Button to={ROUTES.PROFILE}>Account profile</Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function DashboardPage() {
  const { user, student, professor } = useAuth();
  if (user?.role === 'student') return <StudentDashboard student={student} />;
  if (user?.role === 'professor') return <ProfessorDashboard professor={professor} />;
  if (user?.role === 'admin') return <AdminDashboard />;
  return null;
}
