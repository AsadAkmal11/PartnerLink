/**
 * Badge — small inline tag for skills, interests and status labels.
 */
const VARIANTS = {
  default: 'border-border bg-surface-elevated text-text-secondary',
  gold: 'border-primary/35 bg-primary/10 text-primary-highlight',
  muted: 'border-transparent bg-surface-elevated/60 text-text-muted',
  success: 'border-success/30 bg-success/10 text-success',
  outline: 'border-border bg-transparent text-text-muted',
};

const SIZES = {
  sm: 'px-2 py-0.5 text-[0.6875rem]',
  md: 'px-2.5 py-1 text-xs',
};

export default function Badge({ children, variant = 'default', size = 'md', icon: Icon, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-medium leading-none whitespace-nowrap transition-colors duration-300 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
    >
      {Icon && <Icon size={12} aria-hidden="true" />}
      {children}
    </span>
  );
}
