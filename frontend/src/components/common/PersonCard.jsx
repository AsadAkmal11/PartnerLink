/**
 * Minimal person surface used in dashboards / discovery.
 */
export default function PersonCard({
  name,
  subtitle,
  tags = [],
  score,
  footer,
  children,
}) {
  return (
    <article className="group flex h-full flex-col border-b border-border/70 py-5 transition-colors hover:border-primary/40 sm:rounded-[14px] sm:border sm:border-border/70 sm:bg-surface/40 sm:px-5 sm:py-5 sm:backdrop-blur-sm sm:hover:border-primary/35">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-display text-lg tracking-tight text-text">{name}</h3>
          {subtitle && <p className="mt-0.5 truncate text-sm text-text-muted">{subtitle}</p>}
        </div>
        {typeof score === 'number' && (
          <span className="shrink-0 font-mono text-xs tabular-nums text-primary">
            {Math.round(score * 100)}%
          </span>
        )}
      </div>

      {children && (
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-text-secondary">{children}</p>
      )}

      {tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1">
          {tags.map((tag) => (
            <span key={tag} className="text-xs text-text-muted">
              {tag}
            </span>
          ))}
        </div>
      )}

      {footer && <p className="mt-auto pt-4 font-mono text-[0.7rem] text-text-muted">{footer}</p>}
    </article>
  );
}
