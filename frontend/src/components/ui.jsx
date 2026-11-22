import { Link } from 'react-router-dom';

export const INKS = ['var(--pink)', 'var(--blue)', 'var(--yel)', 'var(--teal)', 'var(--org)'];

/** Stable ink per name, so the same person always prints in the same colour. */
export function inkFor(seed = '') {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return INKS[h % INKS.length];
}

export const initials = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

/** Big condensed title printed in two plates: blue, with pink overprinted off-register. */
export function Plates({ children, as: Tag = 'h1', className = 'h-display h1' }) {
  return (
    <Tag className={className}>
      <span className="plates">
        <span className="plate-b">{children}</span>
        <span className="plate-p" aria-hidden="true">
          {children}
        </span>
      </span>
    </Tag>
  );
}

export function Crops() {
  return (
    <div className="crops" aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
    </div>
  );
}

export function Rule() {
  return <i className="rule" aria-hidden="true" />;
}

/** Pill button. `to` renders a router Link, `href` an anchor, otherwise a <button>. */
export function Button({ to, href, variant, size, block, className = '', children, ...rest }) {
  const cls = [
    'btn',
    variant && `btn-${variant}`,
    size && `btn-${size}`,
    block && 'btn-block',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  if (to)
    return (
      <Link to={to} className={cls} {...rest}>
        {children}
      </Link>
    );
  if (href)
    return (
      <a href={href} className={cls} {...rest}>
        {children}
      </a>
    );
  return (
    <button type="button" className={cls} {...rest}>
      {children}
    </button>
  );
}

export function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function ChipSelect({ options, selected, onToggle, tone }) {
  if (options == null) return <p className="loading">Loading options</p>;
  if (!options.length) return <p className="muted mono" style={{ fontSize: 12 }}>No options available — is the API running?</p>;
  return (
    <div className="chips">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          className={'chip' + (tone ? ` chip-${tone}` : '')}
          aria-pressed={selected.includes(opt.id)}
          onClick={() => onToggle(opt.id)}
        >
          {opt.name}
        </button>
      ))}
    </div>
  );
}

export function Segmented({ value, options, onChange, label }) {
  return (
    <div className="seg" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={value === o.value} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Stamp({ status }) {
  return <span className={`stamp stamp-${status}`}>{status}</span>;
}

export function PageHead({ label, title, children }) {
  return (
    <header className="page-head">
      <p className="label rise">{label}</p>
      <div className="rise" style={{ '--d': 80 }}>
        <Plates>{title}</Plates>
        {children && <p className="lead">{children}</p>}
      </div>
    </header>
  );
}

/** The landing's speaker card, reused for every person in the app. */
export function PersonCard({ index, name, role, score, bio, tags = [], domains = [], projects, projectsLink, foot }) {
  const ini = initials(name);
  return (
    <li className="person" style={{ '--a': INKS[index % INKS.length], '--n': index, '--r': `${index % 2 ? 3 : -3}deg` }}>
      <span className="person-art" aria-hidden="true">
        <b className="m-b">{ini}</b>
        <b className="m-p">{ini}</b>
        <span className="person-no">{String(index + 1).padStart(2, '0')}</span>
        {score != null && <span className="person-score">{Math.round(score * 100)}% match</span>}
      </span>
      <span className="person-info">
        <b className="person-name">{name}</b>
        {role && <span className="person-role">{role}</span>}
        {score != null && <span className="sr-only">{Math.round(score * 100)} percent match</span>}
        {bio && <span className="person-bio">“{bio}”</span>}
        {(tags.length > 0 || domains.length > 0) && (
          <span className="tags">
            {tags.map((t) => (
              <span key={'t' + t} className="tag">
                {t}
              </span>
            ))}
            {domains.map((t) => (
              <span key={'d' + t} className="tag tag-domain">
                {t}
              </span>
            ))}
          </span>
        )}
        {projects && (
          <span className="offers">
            <span className="label">
              {projects.length ? `On offer · ${projects.length} ${projects.length === 1 ? 'project' : 'projects'}` : 'No open projects right now'}
            </span>
            {projects.length > 0 && (
              <ul>
                {projects.slice(0, 3).map((p) => (
                  <li key={p.id}>
                    <div>
                      {p.title}
                      <span>Team of {p.team_size}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {projects.length > 0 && projectsLink && (
              <Link to={projectsLink} className="link mono" style={{ fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '.07em' }}>
                {projects.length > 3 ? `All ${projects.length} projects →` : 'Project details →'}
              </Link>
            )}
          </span>
        )}
        {foot && <span className="person-foot">{foot}</span>}
      </span>
    </li>
  );
}

export function Colophon({ right }) {
  return (
    <footer className="colo">
      <span className="colo-inks">
        <span>Matched in two passes</span>
        <i className="chip-dot" style={{ '--i': 'var(--pink)' }} aria-hidden="true" />
        <i className="chip-dot" style={{ '--i': 'var(--blue)' }} aria-hidden="true" />
      </span>
      <span>Ghulam Ishaq Khan Institute · Topi, Swabi</span>
      <span>{right ?? `PartnerLink ’26 · SE course project`}</span>
    </footer>
  );
}
