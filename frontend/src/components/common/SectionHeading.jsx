import { motion } from 'motion/react';
import { fadeUp, stagger, viewportOnce } from '../../lib/motion.js';

/**
 * SectionHeading — eyebrow, title and description with a staggered reveal.
 */
export default function SectionHeading({ eyebrow, title, description, align = 'center', id, className = '' }) {
  const centered = align === 'center';

  return (
    <motion.div
      variants={stagger(0.08)}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      className={`${centered ? 'mx-auto text-center items-center' : 'items-start'} flex max-w-2xl flex-col ${className}`}
    >
      {eyebrow && (
        <motion.p variants={fadeUp} className="eyebrow mb-4 inline-flex items-center gap-2">
          <span aria-hidden="true" className="h-px w-6 bg-primary/60" />
          {eyebrow}
          {centered && <span aria-hidden="true" className="h-px w-6 bg-primary/60" />}
        </motion.p>
      )}
      <motion.h2 variants={fadeUp} id={id} className="heading-section text-balance">
        {title}
      </motion.h2>
      {description && (
        <motion.p variants={fadeUp} className="text-lead mt-5 text-pretty">
          {description}
        </motion.p>
      )}
    </motion.div>
  );
}
