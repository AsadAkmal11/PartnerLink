import { motion } from 'motion/react';
import { fadeUp } from '../../lib/motion.js';

export default function FeatureCard({ icon: Icon, title, description, index }) {
  return (
    <motion.article
      variants={fadeUp}
      className="group relative flex h-full flex-col border-t border-border/80 pt-6"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="glass-pill inline-flex h-10 w-10 items-center justify-center text-primary-highlight">
          <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
        </span>
        <span className="font-mono text-xs tabular-nums text-text-muted">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>
      <h3 className="heading-card mt-5">{title}</h3>
      <p className="text-body mt-2.5">{description}</p>
    </motion.article>
  );
}
