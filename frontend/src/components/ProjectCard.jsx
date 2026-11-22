import { Button, Stamp, accentFor, initials } from './ui.jsx';

/** One FYP project, as a cel on the pegbar. Owners get edit controls. */
export default function ProjectCard({ project: p, index = 0, owner, readonly, busy, onEdit, onToggle, onDelete }) {
  const closed = p.status === 'CLOSED';
  return (
    <li className={`cel cel-hover project rise ${closed ? 'project-closed' : ''}`} style={{ '--d': 60 + index * 60 }}>
      <span className="cel-tl hud">Proj. {String(index + 1).padStart(2, '0')}</span>
      <span className="cel-no hud">
        {p.team_size} {p.team_size === 1 ? 'student' : 'students'}
      </span>
      <div className="project-by">
        <span className="avatar" style={{ '--c': accentFor(p.professor?.name) }} aria-hidden="true">
          {initials(p.professor?.name)}
        </span>
        <span>
          {p.professor?.name}
          {p.professor?.department ? ` · ${p.professor.department}` : ''}
        </span>
        {closed && (
          <span style={{ marginLeft: 'auto' }}>
            <Stamp status="CLOSED" />
          </span>
        )}
      </div>
      <h3 className="project-title">{p.title}</h3>
      <p className="project-summary">{p.summary}</p>
      {(p.domains?.length > 0 || p.skills?.length > 0) && (
        <div className="tags">
          {p.domains?.map((d) => (
            <span key={d.id} className="tag tag-domain">
              {d.name}
            </span>
          ))}
          {p.skills?.map((s) => (
            <span key={s.id} className="tag tag-hot">
              {s.name}
            </span>
          ))}
        </div>
      )}
      {!readonly && (
        <div className="person-foot">
          {owner ? (
            <div className="row-act">
              <Button size="sm" disabled={busy} onClick={() => onEdit?.(p)}>
                Edit
              </Button>
              <Button size="sm" disabled={busy} onClick={() => onToggle?.(p)}>
                {closed ? 'Reopen' : 'Close'}
              </Button>
              <Button size="sm" variant="danger" disabled={busy} onClick={() => onDelete?.(p)}>
                Delete
              </Button>
            </div>
          ) : (
            <>
              <span>Supervised by {p.professor?.name?.split(' ')[0] || 'faculty'}</span>
              {p.professor?.email && (
                <a
                  className="link"
                  href={`mailto:${p.professor.email}?subject=${encodeURIComponent(`FYP: ${p.title}`)}`}
                >
                  Contact faculty
                </a>
              )}
            </>
          )}
        </div>
      )}
    </li>
  );
}
