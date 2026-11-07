import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { EASE_OUT } from '../../lib/motion.js';

const stepVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT, staggerChildren: 0.08, delayChildren: 0.25 } },
};

const pointVariants = {
  hidden: { opacity: 0, x: -8 },
  show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: EASE_OUT } },
};

const nodeVariants = {
  hidden: { scale: 0.6, opacity: 0 },
  show: { scale: 1, opacity: 1, transition: { duration: 0.5, ease: EASE_OUT } },
};

/**
 * StepCard — one step in the How It Works timeline. The numbered node sits
 * on the connecting line (left on mobile, top on desktop).
 */
export default function StepCard({ step, index }) {
  const { icon: Icon, title, description, points } = step;

  return (
    <motion.li variants={stepVariants} className="relative flex gap-5 md:flex-col md:items-center md:gap-0 md:text-center">
      {/* Node */}
      <motion.div variants={nodeVariants} className="relative z-10 shrink-0">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/40 bg-surface-elevated text-primary-highlight shadow-glow">
          <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
        </span>
        <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary font-display text-[0.7rem] font-bold text-on-primary">
          {index + 1}
        </span>
      </motion.div>

      {/* Content */}
      <div className="group flex-1 rounded-2xl border border-border bg-surface p-6 shadow-card transition-[border-color,transform] duration-500 hover:-translate-y-1 hover:border-primary/40 md:mt-8 md:w-full">
        <p className="eyebrow text-[0.6875rem]!">Step {index + 1}</p>
        <h3 className="heading-card mt-2">{title}</h3>
        <p className="text-body mt-2.5">{description}</p>
        <ul className="mt-5 flex flex-col gap-2 md:items-center">
          {points.map((point) => (
            <motion.li key={point} variants={pointVariants} className="inline-flex items-center gap-2 text-sm text-text-secondary">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-success/12 text-success">
                <Check size={12} strokeWidth={3} aria-hidden="true" />
              </span>
              {point}
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.li>
  );
}
