/**
 * Logo — the PartnerLink mark (two linked rings) plus wordmark.
 */
export function LogoMark({ size = 34 }) {
  return (
    <span
      className="relative inline-flex items-center justify-center rounded-[10px] border border-primary/35 bg-surface-elevated"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 32 32" width={size * 0.66} height={size * 0.66} fill="none">
        <circle cx="12.5" cy="16" r="6.5" stroke="var(--color-primary-highlight)" strokeWidth="2.6" />
        <circle cx="19.5" cy="16" r="6.5" stroke="var(--color-primary)" strokeWidth="2.6" />
      </svg>
    </span>
  );
}

export default function Logo({ size = 34 }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={size} />
      <span className="font-display text-[1.15rem] font-bold tracking-tight text-text">
        Partner<span className="text-primary-highlight">Link</span>
      </span>
    </span>
  );
}
