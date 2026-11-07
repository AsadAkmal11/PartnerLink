/**
 * Card — themed surface. `elevated` uses the raised surface colour and a
 * deeper shadow; `interactive` adds hover border/shadow feedback.
 */
export default function Card({
  as: Tag = 'div',
  children,
  className = '',
  elevated = false,
  interactive = false,
  ...rest
}) {
  const classes = [
    'relative rounded-2xl border border-border',
    elevated ? 'bg-surface-elevated shadow-elevated' : 'bg-surface shadow-card',
    interactive
      ? 'transition-[border-color,box-shadow] duration-500 hover:border-primary/40 hover:shadow-elevated'
      : '',
    className,
  ].join(' ');

  return (
    <Tag className={classes} {...rest}>
      {children}
    </Tag>
  );
}
