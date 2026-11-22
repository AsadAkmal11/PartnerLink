import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ATP_SCRIPT, atpDecode, atpLayout, atpNib, atpPath, atpSupported } from '../studio/AnimatorTitlePreloader.tsx';

/* ------------------------------------------------------------- palette --- */

/** Accent inks from the ember preset, rotated per card so a grid never clumps. */
export const ACCENTS = ['#f8bd8a', '#27e1f2', '#ff4a83', '#ffa15a', '#fde3c4', '#f3672f'];
export const accent = (i = 0) => ACCENTS[((i % ACCENTS.length) + ACCENTS.length) % ACCENTS.length];
export const accentFor = (name = '') => accent([...name].reduce((a, c) => a + c.charCodeAt(0), 0));

export const initials = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || '·';

/* --------------------------------------------------------------- hooks --- */

/** True once the element has scrolled into view (and stays true). */
export function useInView(options) {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || on) return undefined;
    if (typeof IntersectionObserver === 'undefined') {
      setOn(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px', ...options },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [on, options]);
  return [ref, on];
}

export function Reveal({ as: Tag = 'div', d = 0, className = '', style, children, ...rest }) {
  const [ref, on] = useInView();
  return (
    <Tag ref={ref} className={`reveal ${className}`} data-on={on ? '1' : '0'} style={{ '--d': d, ...style }} {...rest}>
      {children}
    </Tag>
  );
}

/* ---------------------------------------------------------------- film --- */

/** Shared SVG filters plus the grain and vignette laid over every page. */
export function Film() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);
  return (
    <>
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
        <defs>
          <filter id="pl-boil" x="-10%" y="-30%" width="120%" height="160%">
            <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="2" result="n">
              {reduced ? null : (
                <animate attributeName="seed" values="2;5;8" dur="0.375s" calcMode="discrete" repeatCount="indefinite" />
              )}
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="n" scale="1.6" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="pl-boil-lg" x="-5%" y="-20%" width="110%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="3" result="n">
              {reduced ? null : (
                <animate attributeName="seed" values="3;6;9" dur="0.375s" calcMode="discrete" repeatCount="indefinite" />
              )}
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="n" scale="3" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="pl-grain" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
      </svg>
      <div className="film" aria-hidden="true">
        <svg className="film-grain">
          <rect width="100%" height="100%" filter="url(#pl-grain)" />
        </svg>
        <div className="film-vignette" />
      </div>
    </>
  );
}

/* -------------------------------------------------------------- script --- */

const SCRIPT_OPTS = { jitter: 0.3, condense: 0.86, tracking: 0.3, space: 9, capGap: 2 };
let scriptFont = null;
const font = () => scriptFont || (scriptFont = atpDecode(ATP_SCRIPT));

/**
 * A line of hand-lettering that writes itself on with a broad nib when it
 * scrolls into view — the same Hershey script as the preloader.
 */
export function Script({ text, className = '', seed = 7, duration = 1400, delay = 0, flourish = false, as: Tag = 'span' }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const [ref, seen] = useInView();
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!seen) return undefined;
    const t = setTimeout(() => setOn(true), delay);
    return () => clearTimeout(t);
  }, [seen, delay]);

  const laid = useMemo(() => atpLayout(text, font(), { seed, ...SCRIPT_OPTS }), [text, seed]);

  if (!atpSupported(text)) {
    return (
      <Tag ref={ref} className={`script script-fallback ${className}`}>
        {text}
      </Tag>
    );
  }

  const strokes = laid.strokes.slice();
  const lengths = laid.lengths.slice();
  let y1 = laid.y1;
  if (flourish && strokes.length) {
    const a = laid.x0 - 2;
    const b = laid.x1 + 6;
    const w = b - a;
    const by = laid.y1 + 3;
    const pts = [];
    for (let i = 0; i <= 48; i++) {
      const t = i / 48;
      pts.push(a + w * t - Math.sin(t * Math.PI * 2) * w * 0.03, by + Math.sin(t * Math.PI) * 2.4);
    }
    strokes.push(pts);
    lengths.push(w * 1.1);
    y1 = by + 3.5;
  }
  const r1 = (v) => Math.round(v * 10) / 10;
  const pad = 4;
  const vx = laid.x0 - pad;
  const vy = Math.min(laid.y0, -2) - pad;
  const vw = laid.x1 - laid.x0 + pad * 2 + (flourish ? 8 : 0);
  const vh = Math.max(y1, 30) - vy + pad;
  const total = lengths.reduce((s, l) => s + l, 0) || 1;
  const pause = 0.03;
  const span = 1 + pause * strokes.length;
  let acc = 0;
  const nib = 1.3;
  const angle = (-38 * Math.PI) / 180;
  const nx = Math.cos(angle) * nib;
  const ny = Math.sin(angle) * nib;

  return (
    <Tag ref={ref} className={`script ${className}`} data-on={on ? '1' : '0'}>
      <span className="sr-only" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clipPath: 'inset(50%)' }}>
        {text}
      </span>
      <svg
        viewBox={`${r1(vx)} ${r1(vy)} ${r1(vw)} ${r1(vh)}`}
        style={{ width: `${r1(vw / 21)}em`, height: `${r1(vh / 21)}em` }}
        aria-hidden="true"
      >
        <defs>
          <mask id={`${uid}m`} maskUnits="userSpaceOnUse" x={vx} y={vy} width={vw} height={vh}>
            <g fill="none" stroke="#fff" strokeWidth={nib * 3.4} strokeLinecap="round" strokeLinejoin="round">
              {strokes.map((s, i) => {
                const start = (acc / total + pause * i) / span;
                acc += lengths[i];
                const len = lengths[i] / total / span;
                return (
                  <path
                    key={i}
                    className="w"
                    d={atpPath(s)}
                    pathLength={1}
                    style={{
                      transitionDelay: `${Math.round(start * duration)}ms`,
                      transitionDuration: `${Math.max(40, Math.round(len * duration))}ms`,
                    }}
                  />
                );
              })}
            </g>
          </mask>
        </defs>
        <g mask={`url(#${uid}m)`} filter="url(#pl-boil)">
          <path d={strokes.map((s) => atpNib(s, nx, ny)).join('')} fill="currentColor" />
          <path
            d={strokes.map(atpPath).join('')}
            fill="none"
            stroke="currentColor"
            strokeWidth={nib * 0.55}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </Tag>
  );
}

/* --------------------------------------------------------------- paint --- */

/** The bold title: blue-pencil rough and pink ghost first, then painted up. */
export function Paint({ as: Tag = 'h1', size = 't-page', d = 0, children, className = '' }) {
  return (
    <Tag className={`paint ${size} ${className}`} style={{ '--d': d }}>
      <span className="paint-ghost" aria-hidden="true">
        {children}
      </span>
      <span className="paint-rough" aria-hidden="true">
        {children}
      </span>
      <span className="paint-fill">{children}</span>
    </Tag>
  );
}

/** A construction line drawn on when it scrolls into view. */
export function Rule() {
  const [ref, on] = useInView();
  return (
    <svg ref={ref} className="rule" data-on={on ? '1' : '0'} viewBox="0 0 1000 14" preserveAspectRatio="none" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeLinecap="round" filter="url(#pl-boil)">
        <path pathLength={1} d="M2 8 C180 5 340 10 520 7 S860 5 998 8" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
        <path
          pathLength={1}
          d="M10 10 C200 8 400 11 600 9 S880 8 990 10"
          strokeWidth="1"
          stroke="#ff2e88"
          opacity=".55"
          vectorEffect="non-scaling-stroke"
        />
      </g>
    </svg>
  );
}

/* ---------------------------------------------------------------- bits --- */

export function Brand({ sub = 'GIKI · FYP matchmaker' }) {
  return (
    <Link to="/" className="brand" aria-label="PartnerLink home">
      <img src="/giki.png" alt="" width="40" height="40" />
      <span className="brand-word">
        <b>PartnerLink</b>
        {sub && <span>{sub}</span>}
      </span>
    </Link>
  );
}

export function Pegs() {
  return (
    <div className="pegs" aria-hidden="true">
      <i />
      <i />
      <i />
    </div>
  );
}

export function Trinket({ className = '' }) {
  return (
    <svg className={`trinket ${className}`} viewBox="0 0 30 70" aria-hidden="true">
      <g filter="url(#pl-boil)" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 1 L15 16" />
        <circle cx="15" cy="21" r="4.4" />
        <path d="M15 27 C22 31 26 37 25 44 C24 52 19 57 15 63 C11 57 6 52 5 44 C4 37 8 31 15 27 Z" />
        <path d="M11 41 C13 38 17 38 19 41" opacity=".7" />
        <circle cx="15" cy="49" r="1.6" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}

/** The little spectacled mascot from the preloader. */
export function Mascot({ wink = false, className = '', d = 0 }) {
  return (
    <svg className={`mascot ${className}`} viewBox="0 0 120 84" aria-hidden="true" style={{ '--d': d }}>
      <g filter="url(#pl-boil)" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="44" cy="12" r="2.4" fill="currentColor" stroke="none" />
        <circle cx="60" cy="10" r="5" fill="currentColor" stroke="none" />
        <circle cx="76" cy="12" r="2.4" fill="currentColor" stroke="none" />
        <path
          className="md"
          pathLength={1}
          d="M58 52 C58 40 44 36 34 40 C22 45 22 62 34 65 C46 68 56 62 58 52 C60 62 70 68 82 65 C94 62 98 45 86 40 C76 36 62 40 62 52"
        />
        <path className="md" pathLength={1} d="M22 46 C14 44 9 47 6 52 M98 46 C106 44 111 47 114 52" />
        <g className="eye">
          <circle cx="40" cy="53" r="4.6" fill="currentColor" stroke="none" />
        </g>
        {wink ? (
          <path d="M71 54 Q80 59 89 54" />
        ) : (
          <g className="eye">
            <circle cx="80" cy="53" r="4.6" fill="currentColor" stroke="none" />
          </g>
        )}
      </g>
    </svg>
  );
}

export function Button({ to, href, variant, size, block, className = '', children, arrow, ...props }) {
  const cls = ['btn', variant && `btn-${variant}`, size && `btn-${size}`, block && 'btn-block', className]
    .filter(Boolean)
    .join(' ');
  const body = (
    <>
      {children}
      {arrow && (
        <span className="arr" aria-hidden="true">
          →
        </span>
      )}
    </>
  );
  if (to)
    return (
      <Link to={to} className={cls} {...props}>
        {body}
      </Link>
    );
  if (href)
    return (
      <a href={href} className={cls} {...props}>
        {body}
      </a>
    );
  return (
    <button type="button" className={cls} {...props}>
      {body}
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

/** options === null/undefined means still loading; [] means nothing came back. */
export function ChipSelect({ options, selected, onToggle, tone }) {
  if (options == null) return <p className="loading">Loading options</p>;
  if (options.length === 0) return <p className="muted">No options available — is the API running?</p>;
  return (
    <div className={`chips ${tone === 'cyan' ? 'chips-cyan' : ''}`}>
      {options.map((o) => (
        <button key={o.id} type="button" className="chip" aria-pressed={selected.includes(o.id)} onClick={() => onToggle(o.id)}>
          {o.name}
        </button>
      ))}
    </div>
  );
}

export function Segmented({ label, value, onChange, options }) {
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
  return (
    <span className="stamp" data-s={status}>
      {String(status).toLowerCase()}
    </span>
  );
}

/** HUD pipeline: Rough · Ink · Paint · Final, with `at` the current step. */
export function Steps({ items, at }) {
  return (
    <div className="steps hud">
      {items.map((s, i) => (
        <span key={s} className="step" data-on={i === at ? '1' : '0'} data-done={i < at ? '1' : '0'}>
          {s}
        </span>
      ))}
    </div>
  );
}

const pad = (n) => String(n).padStart(4, '0');

/** Page header: slate HUD, a hand-lettered kicker and a painted title. */
export function PageHead({ scene, title, script, meta, children }) {
  return (
    <header className="page-head">
      <div className="page-hud hud rise">
        <span>
          Sc. {String(scene).padStart(2, '0')} — {meta}
        </span>
        <span>
          Fr <b>{pad(scene * 24)}</b> / 0120
        </span>
      </div>
      {script && <Script text={script} className="s-lg s-peach" seed={scene * 3 + 1} />}
      <div>
        <Paint d={120}>{title}</Paint>
      </div>
      {children && (
        <p className="lead rise" style={{ '--d': 300 }}>
          {children}
        </p>
      )}
    </header>
  );
}

export function SectionHead({ script, title, children, seed = 5 }) {
  return (
    <div className="section-head">
      <div>
        {script && <Script text={script} className="s-md s-cyan" seed={seed} />}
        <h2 className="h3" style={{ fontSize: 'clamp(26px, 3vw, 40px)', letterSpacing: '-0.035em', fontWeight: 900 }}>
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

export function PersonCard({ index = 0, name, role, score, bio, tags = [], domains = [], projects, projectsLink, foot }) {
  return (
    <li className="cel cel-hover person rise" style={{ '--d': 60 + index * 60 }}>
      <span className="cel-no hud">No. {String(index + 1).padStart(2, '0')}</span>
      <div className="person-top">
        <span className="avatar" style={{ '--c': accent(index) }} aria-hidden="true">
          {initials(name)}
        </span>
        <div className="person-id">
          <p className="person-name">{name}</p>
          <p className="person-role">{role || '—'}</p>
        </div>
        {score != null && (
          <div className="score">
            <b>{Math.round(score * 100)}%</b>
            <span className="hud">fit</span>
          </div>
        )}
      </div>
      {bio && <p className="person-bio">{bio}</p>}
      {(tags.length > 0 || domains.length > 0) && (
        <div className="tags">
          {domains.map((d) => (
            <span key={`d-${d}`} className="tag tag-domain">
              {d}
            </span>
          ))}
          {tags.map((t) => (
            <span key={`t-${t}`} className="tag">
              {t}
            </span>
          ))}
        </div>
      )}
      {projects && (
        <div className="offers">
          <span className="hud">
            On offer · <b>{projects.length}</b> {projects.length === 1 ? 'project' : 'projects'}
          </span>
          {projects.length > 0 ? (
            <>
              <ul>
                {projects.slice(0, 3).map((p) => (
                  <li key={p.id}>
                    {p.title}
                    <span>{p.team_size} ppl</span>
                  </li>
                ))}
              </ul>
              {projectsLink && (
                <Link to={projectsLink} className="link">
                  Project details →
                </Link>
              )}
            </>
          ) : (
            <p className="muted" style={{ fontSize: 13.5, marginTop: 6 }}>
              No open projects right now.
            </p>
          )}
        </div>
      )}
      {foot && <div className="person-foot">{foot}</div>}
    </li>
  );
}
