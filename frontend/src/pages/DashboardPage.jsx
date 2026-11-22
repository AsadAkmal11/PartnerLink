import { useEffect, useState } from 'react';
import { ACCENTS, Button, PageHead, PersonCard, Rule, SectionHead, Stamp, Steps } from '../components/ui.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import { ROUTES } from '../routes/paths.js';

const firstName = (n) => n?.split(' ')[0] || 'there';
const BAR_INKS = ['var(--paint)', ...ACCENTS.slice(1)];

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

  const hasSkills = Boolean(student?.skills?.length);
  const hasDomains = Boolean(student?.desired_domains?.length);
  const hasCgpa = student?.cgpa != null;
  const needsProfile = !hasSkills || !hasDomains || !hasCgpa;
  const done = [hasCgpa, hasSkills, hasDomains].filter(Boolean).length;
  const best = recs?.[0]?.similarity_score;

  return (
    <>
      <PageHead scene={1} meta="Student workspace" script="hello there," title={`Hi, ${firstName(student?.name)}.`}>
        Ranked teammates from skill overlap, shared research domains and CGPA fit. Scores refresh every time a profile
        changes.
      </PageHead>

      <div className="stats rise" style={{ '--d': 360 }}>
        <div className="stat">
          <span className="hud">Matches</span>
          <b className="hotnum">{recs ? recs.length : '—'}</b>
        </div>
        <div className="stat">
          <span className="hud">Best fit</span>
          <b className="cyannum">{best != null ? `${Math.round(best * 100)}%` : '—'}</b>
        </div>
        <div className="stat">
          <span className="hud">Your skills</span>
          <b>{student?.skills?.length ?? 0}</b>
        </div>
        <div className="stat">
          <span className="hud">CGPA</span>
          <b>{hasCgpa ? student.cgpa.toFixed(2) : '—'}</b>
        </div>
      </div>

      {needsProfile && (
        <section className="section" style={{ marginTop: 28 }}>
          <div className="cel cel-hot callout rise" style={{ '--d': 420 }}>
            <span className="cel-tl hud">Still in rough</span>
            <div style={{ display: 'grid', gap: 12 }}>
              <p className="h3">Add CGPA, skills and target domains to sharpen your matches.</p>
              <Steps items={['CGPA', 'Skills', 'Domains', 'Matched']} at={done} />
            </div>
            <Button to={ROUTES.PROFILE} variant="hot" arrow>
              Finish profile
            </Button>
          </div>
        </section>
      )}

      {recs?.length > 0 && (
        <section className="section">
          <Rule />
          <SectionHead script="score ruler" title="Who fits best" seed={81} />
          <div className="ruler">
            {recs.slice(0, 6).map(({ student: peer, similarity_score }, i) => (
              <div className="bar" key={peer.id}>
                <span className="bar-name">{peer.name}</span>
                <span className="bar-track" aria-hidden="true">
                  <i
                    className="bar-fill"
                    style={{ '--w': `${Math.max(4, similarity_score * 100)}%`, '--c': BAR_INKS[i % BAR_INKS.length], '--n': i }}
                  />
                </span>
                <span className="bar-v">{Math.round(similarity_score * 100)}%</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="section">
        <Rule />
        <SectionHead script="recommended for you" title="Your top teammates" seed={82}>
          <Button to={ROUTES.DISCOVERY} arrow>
            Browse directory
          </Button>
        </SectionHead>
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
          <SectionHead script="projects on offer" title="Supervisors want you" seed={83}>
            <Button to={ROUTES.PROJECTS} arrow>
              All {offers.length} projects
            </Button>
          </SectionHead>
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
      <PageHead scene={1} meta="Faculty workspace" script="welcome back," title={`Hi, ${firstName(professor?.name)}.`}>
        Students only ever see approved faculty. Keep your research domains current so the right groups find you.
      </PageHead>
      <div className="grid-2">
        <div className="cel rise" style={{ '--d': 360 }}>
          <span className="cel-tl hud">Approval status</span>
          <div className="callout" style={{ marginBottom: 14 }}>
            <p className="h3">Your listing</p>
            <Stamp status={status} />
          </div>
          <p className="muted">{copy}</p>
        </div>
        <div className="cel cel-cyan rise" style={{ '--d': 420 }}>
          <span className="cel-tl hud">Research domains</span>
          <div className="tags" style={{ margin: '4px 0 24px' }}>
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
          <Button to={ROUTES.PROFILE} variant="solid" arrow>
            Update faculty profile
          </Button>
        </div>
      </div>

      <section className="section">
        <Rule />
        <SectionHead script="your projects" title={open.length ? `${open.length} on offer` : 'Nothing on offer yet'} seed={84}>
          <div className="row-act">
            {status === 'APPROVED' && <Button to={ROUTES.DISCOVERY}>Browse students</Button>}
            <Button to={ROUTES.PROJECTS} variant="hot" arrow>
              {status === 'APPROVED' ? 'Post a project' : 'View projects'}
            </Button>
          </div>
        </SectionHead>
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
      <PageHead scene={1} meta="Admin workspace" script="on duty today" title="Moderator desk.">
        Review faculty registrations and keep the directory trustworthy. Every decision is stored with who acted and
        when.
      </PageHead>
      <div className="grid-2">
        <div className="cel cel-hot rise" style={{ '--d': 360 }}>
          <span className="cel-tl hud">Pending faculty</span>
          <p
            className="paint"
            style={{ fontSize: 'clamp(90px, 11vw, 170px)', margin: '6px 0 22px', display: 'block' }}
          >
            <span className="paint-fill">{pending ? pending.length : '—'}</span>
          </p>
          <Button to={ROUTES.ADMIN} variant="hot" arrow>
            Open approvals
          </Button>
        </div>
        <div className="cel rise" style={{ '--d': 420 }}>
          <span className="cel-tl hud">Directory</span>
          <p className="h3" style={{ marginBottom: 12 }}>
            Everyone, in one place.
          </p>
          <p className="muted" style={{ marginBottom: 24 }}>
            Browse every student and approved professor, plus every project faculty are offering.
          </p>
          <div className="row-act">
            <Button to={ROUTES.DISCOVERY}>Browse discovery</Button>
            <Button to={ROUTES.PROJECTS}>All projects</Button>
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
