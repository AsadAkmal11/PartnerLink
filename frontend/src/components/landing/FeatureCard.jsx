import { motion } from 'motion/react';
import { EASE_OUT, fadeUp } from '../../lib/motion.js';

const cardVariants = {
  ...fadeUp,
  hover: { y: -6, transition: { duration: 0.35, ease: EASE_OUT } },
};

// Icon reacts when the pointer is anywhere over the parent card.
const iconVariants = {
  hidden: { rotate: 0, scale: 1 },
  show: { rotate: 0, scale: 1 },
  hover: { rotate: -10, scale: 1.12, transition: { type: 'spring', stiffness: 300, damping: 15 } },
};

export default function FeatureCard({ icon: Icon, title, description, index }) {
  return (
    <motion.article
      variants={cardVariants}
      whileHover="hover"
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-card transition-[border-color,box-shadow] duration-500 hover:border-primary/40 hover:shadow-elevated sm:p-7"
    >
      {/* Decorative: corner glow + top hairline revealed on hover */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: 'radial-gradient(closest-side, color-mix(in oklab, var(--color-primary) 30%, transparent), transparent)' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-6 top-0 h-px origin-center scale-x-0 bg-gradient-to-r from-transparent via-primary to-transparent transition-transform duration-500 group-hover:scale-x-100"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-6 top-5 font-display text-4xl font-extrabold text-border/80 transition-colors duration-500 group-hover:text-primary/25"
      >
        {String(index + 1).padStart(2, '0')}
      </span>

      <motion.span
        variants={iconVariants}
        className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary-highlight"
      >
        <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
      </motion.span>

      <h3 className="heading-card relative mt-6">{title}</h3>
      <p className="text-body relative mt-2.5">{description}</p>
    </motion.article>
  );
}
