/**
 * Badge — small inline tag, e.g. for skills or status labels.
 */
export default function Badge({ children, variant = 'default' }) {
  const variants = {
    default: 'bg-navy-700/60 text-cream-100 border border-navy-700',
    cream:   'bg-cream-100/10 text-cream-100 border border-cream-100/30',
    gold:    'bg-cream-400/10 text-cream-400 border border-cream-400/30',
    muted:   'bg-navy-900/60 text-cream-200/50 border border-navy-700/50',
  };

  return (
    <span
      className={`inline-block rounded-full px-3 py-0.5 text-xs font-medium transition-colors ${variants[variant]}`}
    >
      {children}
    </span>
  );
}
