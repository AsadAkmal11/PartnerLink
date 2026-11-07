/**
 * Shared Motion for React variants.
 * Keep durations between 0.4s and 0.8s and easing gentle — no bouncy springs
 * for entrances. Reduced-motion users are handled globally by <MotionConfig>.
 */

export const EASE_OUT = [0.22, 1, 0.36, 1];

/** Default viewport settings for scroll-triggered reveals. */
export const viewportOnce = { once: true, amount: 0.2 };

export const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT } },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.94, y: 16 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.8, ease: EASE_OUT } },
};

/** Word-by-word headline reveal — each word rises out of a clipping mask. */
export const wordReveal = {
  hidden: { y: '110%' },
  show: { y: '0%', transition: { duration: 0.85, ease: EASE_OUT } },
};

/** Container that staggers its children. */
export function stagger(staggerChildren = 0.1, delayChildren = 0) {
  return {
    hidden: {},
    show: { transition: { staggerChildren, delayChildren } },
  };
}

/** Gentle hover lift for cards (used with whileHover="hover"). */
export const cardHover = {
  hover: { y: -6, transition: { duration: 0.35, ease: EASE_OUT } },
};

/** Endless, slow vertical float for decorative elements. */
export function float(distance = 10, duration = 6, delay = 0) {
  return {
    animate: { y: [0, -distance, 0] },
    transition: { duration, delay, repeat: Infinity, ease: 'easeInOut' },
  };
}
