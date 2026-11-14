import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { ROUTES } from '../../routes/paths.js';

const MotionLink = motion.create(Link);

const VARIANTS = {
  primary:
    'btn-sheen bg-primary text-on-primary shadow-[0_8px_24px_-12px_var(--color-primary)] hover:brightness-110 hover:shadow-glow',
  secondary:
    'border border-border bg-surface/70 text-text backdrop-blur hover:border-primary/50 hover:bg-surface-elevated',
  ghost: 'text-text-secondary hover:text-text hover:bg-surface-elevated/70',
};

const SIZES = {
  sm: 'h-9 px-4 text-sm gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-12 px-6 text-[0.95rem] gap-2.5',
};

const MOTION = {
  whileHover: { y: -2 },
  whileTap: { scale: 0.97, y: 0 },
  transition: { type: 'spring', stiffness: 420, damping: 28 },
};

/**
 * Button — renders the right element for the destination:
 *   href="#section" → in-page anchor (works from any route)
 *   to="/path"      → router link
 *   href="https://…" → external anchor
 *   neither         → <button>
 */
export default function Button({
  children,
  href,
  to,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'right',
  className = '',
  ...rest
}) {
  const { pathname } = useLocation();

  const classes = [
    'group inline-flex shrink-0 items-center justify-center rounded-xl font-semibold whitespace-nowrap',
    'transition-[background-color,border-color,color,box-shadow,filter] duration-300',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
    VARIANTS[variant],
    SIZES[size],
    className,
  ].join(' ');

  const icon = Icon ? (
    <Icon
      size={size === 'sm' ? 15 : 17}
      aria-hidden="true"
      className={`transition-transform duration-300 ${
        iconPosition === 'right' ? 'group-hover:translate-x-0.5' : ''
      }`}
    />
  ) : null;

  const content = (
    <>
      {iconPosition === 'left' && icon}
      <span>{children}</span>
      {iconPosition === 'right' && icon}
    </>
  );

  if (href?.startsWith('#')) {
    if (pathname === ROUTES.HOME) {
      return (
        <motion.a href={href} className={classes} {...MOTION} {...rest}>
          {content}
        </motion.a>
      );
    }
    return (
      <MotionLink to={{ pathname: ROUTES.HOME, hash: href }} className={classes} {...MOTION} {...rest}>
        {content}
      </MotionLink>
    );
  }

  if (to) {
    return (
      <MotionLink to={to} className={classes} {...MOTION} {...rest}>
        {content}
      </MotionLink>
    );
  }

  if (href) {
    return (
      <motion.a href={href} className={classes} {...MOTION} {...rest}>
        {content}
      </motion.a>
    );
  }

  const { type = 'button', ...buttonRest } = rest;
  return (
    <motion.button type={type} className={classes} {...MOTION} {...buttonRest}>
      {content}
    </motion.button>
  );
}
