import { motion } from 'motion/react';

/**
 * BackgroundGlow — slow-drifting radial light behind the hero.
 * Only three blurred layers, each animating transform (GPU friendly).
 * The third layer is hidden on small screens to save battery.
 */
export default function BackgroundGlow() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="bg-grid absolute inset-0 opacity-60 light:opacity-80" />

      <motion.div
        className="absolute -top-40 left-1/2 h-[34rem] w-[52rem] -translate-x-1/2 rounded-full opacity-70 blur-3xl"
        style={{
          background:
            'radial-gradient(closest-side, color-mix(in oklab, var(--color-primary) 22%, transparent), transparent)',
        }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.55, 0.75, 0.55] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="absolute top-1/3 -right-40 h-[28rem] w-[28rem] rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(closest-side, color-mix(in oklab, var(--color-primary-highlight) 14%, transparent), transparent)',
        }}
        animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="absolute -bottom-32 -left-32 hidden h-[26rem] w-[30rem] rounded-full blur-3xl md:block"
        style={{
          background:
            'radial-gradient(closest-side, color-mix(in oklab, var(--color-text-muted) 14%, transparent), transparent)',
        }}
        animate={{ x: [0, 50, 0], y: [0, -20, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Fade into the page background at the bottom edge */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
    </div>
  );
}
