import { motion } from 'motion/react';
import { stagger, viewportOnce } from '../../lib/motion.js';

/**
 * AnimatedSection — a <section> whose direct motion children (using the
 * shared "hidden"/"show" variants) reveal with a stagger when scrolled into view.
 */
export default function AnimatedSection({
  id,
  children,
  className = '',
  staggerChildren = 0.12,
  delayChildren = 0,
  ...rest
}) {
  return (
    <motion.section
      id={id}
      variants={stagger(staggerChildren, delayChildren)}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      className={`relative ${className}`}
      {...rest}
    >
      {children}
    </motion.section>
  );
}
