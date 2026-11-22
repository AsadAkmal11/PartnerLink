import { Button } from './ui.jsx';

export default function ProjectCard({ project, index = 0, owner, readonly, busy, onEdit, onToggle, onDelete }) {
  const closed = project.status === 'CLOSED';
  return (
    <li className={'project' + (closed ? ' project-closed' : '')} style={{ '--n': index }}>
      <div className="project-top">
        <span className="label">
          {String(index + 1).padStart(2, '0')} · Team of {project.team_size}
        </span>
        {closed && <span className="stamp stamp-REJECTED">Closed</span>}
      </div>
      <h3 className="project-title">{project.title}</h3>
      <p className="person-role">
        {project.professor.name} · {project.professor.department}
      </p>
      <p className="project-summary">{project.summary}</p>
      {(project.domains.length > 0 || project.skills.length > 0) && (
        <div className="tags">
          {project.domains.map((d) => (
            <span key={d.id} className="tag tag-domain">
              {d.name}
            </span>
          ))}
          {project.skills.map((d) => (
            <span key={d.id} className="tag">
              {d.name}
            </span>
          ))}
        </div>
      )}
      {!readonly && <div className="project-foot">
        {owner ? (
          <div className="row-act">
            <Button size="sm" onClick={() => onEdit(project)} disabled={busy}>
              Edit
            </Button>
            <Button size="sm" onClick={() => onToggle(project)} disabled={busy}>
              {closed ? 'Reopen' : 'Close'}
            </Button>
            <Button size="sm" onClick={() => onDelete(project)} disabled={busy}>
              Delete
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            variant="solid"
            href={`mailto:${project.professor.email}?subject=${encodeURIComponent('FYP: ' + project.title)}`}
          >
            Contact faculty
          </Button>
        )}
      </div>}
    </li>
  );
}
