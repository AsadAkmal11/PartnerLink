import Badge from './Badge.jsx';
import Card from './Card.jsx';
import Avatar from './Avatar.jsx';

export default function PersonCard({
  name,
  subtitle,
  tags = [],
  score,
  footer,
  children,
}) {
  return (
    <Card interactive elevated className="flex h-full flex-col p-5">
      <div className="flex items-start gap-3">
        <Avatar name={name} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate font-display text-base font-semibold">{name}</h3>
            {typeof score === 'number' && (
              <span className="shrink-0 rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary">
                {Math.round(score * 100)}% match
              </span>
            )}
          </div>
          {subtitle && <p className="mt-0.5 text-sm text-text-muted">{subtitle}</p>}
        </div>
      </div>
      {children && <div className="mt-3 text-sm text-text-secondary">{children}</div>}
      {tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>
      )}
      {footer && <div className="mt-auto pt-4 text-xs text-text-muted">{footer}</div>}
    </Card>
  );
}
