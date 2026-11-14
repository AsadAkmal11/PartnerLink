import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, ShieldCheck, Sparkles } from 'lucide-react';
import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';
import PersonCard from '../components/common/PersonCard.jsx';
import Badge from '../components/common/Badge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import { ROUTES } from '../routes/paths.js';

function StudentDashboard({ student }) {
  const [recs, setRecs] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .recommendations(8)
      .then(setRecs)
      .catch((err) => setError(err.message));
  }, []);

  const needsProfile =
    !student?.skills?.length || !student?.desired_domains?.length || student?.cgpa == null;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-medium text-primary">Student workspace</p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">
          Hi {student?.name?.split(' ')[0] || 'there'}
        </h1>
        <p className="mt-2 max-w-2xl text-text-secondary">
          Ranked peer recommendations are computed from skill overlap, shared research domains, and CGPA fit.
        </p>
      </header>

      {needsProfile && (
        <Card className="border-primary/30 bg-primary/5 p-5">
          <p className="font-medium">Complete your profile to improve matches</p>
          <p className="mt-1 text-sm text-text-secondary">
            Add CGPA, skills, and desired FYP domains so the engine can rank compatible teammates.
          </p>
          <Button to={ROUTES.PROFILE} size="sm" className="mt-4" icon={Sparkles}>
            Edit profile
          </Button>
        </Card>
      )}

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-display text-xl font-semibold">Top recommendations</h2>
          <Button to={ROUTES.DISCOVERY} variant="secondary" size="sm" icon={Compass}>
            Browse directory
          </Button>
        </div>
        {error && <p className="text-sm text-error">{error}</p>}
        {!error && recs.length === 0 && (
          <Card className="p-6 text-sm text-text-muted">No recommendations yet. Update your profile and check back.</Card>
        )}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recs.map(({ student: peer, similarity_score }) => (
            <PersonCard
              key={peer.id}
              name={peer.name}
              subtitle={peer.program || peer.email}
              score={similarity_score}
              tags={[
                ...peer.skills.slice(0, 3).map((s) => s.name),
                ...peer.desired_domains.slice(0, 2).map((d) => d.name),
              ]}
              footer={peer.cgpa != null ? `CGPA ${peer.cgpa.toFixed(2)}` : undefined}
            >
              {peer.bio}
            </PersonCard>
          ))}
        </div>
      </section>
    </div>
  );
}

function ProfessorDashboard({ professor }) {
  const status = professor?.approval_status || 'PENDING';
  const tone = status === 'APPROVED' ? 'success' : status === 'REJECTED' ? 'default' : 'gold';

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-medium text-primary">Faculty workspace</p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Welcome, {professor?.name}</h1>
        <p className="mt-2 max-w-2xl text-text-secondary">
          Students only see approved faculty in the directory. Keep your research domains up to date.
        </p>
      </header>
      <Card elevated className="p-6">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-display text-lg font-semibold">Approval status</h2>
          <Badge variant={tone}>{status}</Badge>
        </div>
        <p className="mt-3 text-sm text-text-secondary">
          {status === 'PENDING' && 'An admin will review your registration shortly.'}
          {status === 'APPROVED' && 'You are visible to students in faculty discovery.'}
          {status === 'REJECTED' &&
            (professor.approval_note
              ? `Rejected: ${professor.approval_note}`
              : 'Your registration was rejected. Contact an admin if this is unexpected.')}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {professor?.domains?.map((d) => (
            <Badge key={d.id} variant="gold">
              {d.name}
            </Badge>
          ))}
        </div>
        <Button to={ROUTES.PROFILE} size="sm" className="mt-5">
          Update faculty profile
        </Button>
      </Card>
    </div>
  );
}

function AdminDashboard() {
  const [pending, setPending] = useState([]);

  useEffect(() => {
    api.approvals('PENDING').then(setPending).catch(() => setPending([]));
  }, []);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-medium text-primary">Admin workspace</p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Moderator overview</h1>
        <p className="mt-2 text-text-secondary">Review faculty registrations and keep the directory trustworthy.</p>
      </header>
      <Card elevated className="p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold">Pending faculty</h2>
            <p className="mt-1 text-sm text-text-muted">{pending.length} awaiting review</p>
          </div>
          <Button to={ROUTES.ADMIN} icon={ShieldCheck}>
            Open approvals
          </Button>
        </div>
      </Card>
      <div className="flex flex-wrap gap-3">
        <Button to={ROUTES.DISCOVERY} variant="secondary" icon={Compass}>
          Browse discovery
        </Button>
        <Link to={ROUTES.PROFILE} className="text-sm text-primary hover:underline">
          Account profile
        </Link>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, student, professor } = useAuth();

  if (user?.role === 'student') return <StudentDashboard student={student} />;
  if (user?.role === 'professor') return <ProfessorDashboard professor={professor} />;
  if (user?.role === 'admin') return <AdminDashboard />;
  return null;
}
