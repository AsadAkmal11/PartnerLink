/**
 * Avatar — initials on a tinted tile. Tones stay within the design tokens.
 */
const TONES = {
  gold: 'bg-primary/15 text-primary-highlight ring-primary/30',
  navy: 'bg-surface-elevated text-text ring-border',
  success: 'bg-success/12 text-success ring-success/25',
  soft: 'bg-text-muted/15 text-text-secondary ring-text-muted/25',
};

const SIZES = {
  sm: 'h-8 w-8 text-[0.7rem] rounded-lg',
  md: 'h-10 w-10 text-xs rounded-xl',
  lg: 'h-12 w-12 text-sm rounded-xl',
};

function initialsOf(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

export default function Avatar({ name, tone = 'gold', size = 'md', className = '' }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center font-display font-bold ring-1 ring-inset ${TONES[tone]} ${SIZES[size]} ${className}`}
    >
      {initialsOf(name)}
    </span>
  );
}
