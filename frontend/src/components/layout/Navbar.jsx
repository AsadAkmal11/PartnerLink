import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react';
import { ArrowRight, Menu, X } from 'lucide-react';
import Logo from '../common/Logo.jsx';
import Button from '../common/Button.jsx';
import SectionLink from '../common/SectionLink.jsx';
import ThemeToggle from '../common/ThemeToggle.jsx';
import { useActiveSection } from '../../hooks/useActiveSection.js';
import { NAV_ITEMS, NAV_SECTION_IDS } from '../../data/landing.js';
import { EASE_OUT } from '../../lib/motion.js';
import { ROUTES } from '../../routes/paths.js';

const MOBILE_MENU_ID = 'mobile-navigation';

export default function Navbar() {
  const { pathname } = useLocation();
  const isHome = pathname === ROUTES.HOME;
  const active = useActiveSection(NAV_SECTION_IDS, isHome);

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef(null);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 24));

  // Close the mobile menu on Escape, and when resizing up to desktop.
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    const desktop = window.matchMedia('(min-width: 768px)');
    const onResize = (e) => e.matches && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    desktop.addEventListener('change', onResize);
    return () => {
      window.removeEventListener('keydown', onKey);
      desktop.removeEventListener('change', onResize);
    };
  }, [menuOpen]);

  const solid = scrolled || menuOpen;

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: EASE_OUT }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div
        className={`border-b transition-[background-color,border-color,box-shadow] duration-500 ${
          solid ? 'glass-solid border-border shadow-card' : 'glass border-transparent'
        }`}
      >
        <nav
          aria-label="Primary"
          className={`mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 transition-[height] duration-500 sm:px-8 ${
            scrolled ? 'h-16' : 'h-[4.5rem]'
          }`}
        >
          <Link
            to={ROUTES.HOME}
            aria-label="PartnerLink home"
            className="rounded-lg"
            onClick={() => setMenuOpen(false)}
          >
            <Logo />
          </Link>

          {/* Desktop links */}
          <ul className="hidden items-center gap-1 rounded-full border border-border/70 bg-surface/40 p-1 md:flex">
            {NAV_ITEMS.map(({ id, label }) => {
              const isActive = active === id;
              return (
                <li key={id}>
                  <SectionLink
                    id={id}
                    aria-current={isActive ? 'true' : undefined}
                    className={`relative block rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-300 ${
                      isActive ? 'text-text' : 'text-text-muted hover:text-text'
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="nav-active-pill"
                        transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                        className="absolute inset-0 -z-0 rounded-full border border-primary/30 bg-primary/10"
                      />
                    )}
                    <span className="relative">{label}</span>
                  </SectionLink>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="hidden sm:block">
              <Button href="#get-started" size="sm" icon={ArrowRight}>
                Get Started
              </Button>
            </div>
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls={MOBILE_MENU_ID}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface/60 text-text transition-colors hover:border-primary/50 md:hidden"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={menuOpen ? 'close' : 'open'}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex"
                >
                  {menuOpen ? <X size={19} aria-hidden="true" /> : <Menu size={19} aria-hidden="true" />}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              key="backdrop"
              aria-hidden="true"
              onClick={() => setMenuOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 top-16 -z-10 bg-background/60 backdrop-blur-sm md:hidden"
            />
            <motion.div
              key="panel"
              id={MOBILE_MENU_ID}
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.3, ease: EASE_OUT }}
              className="glass-solid mx-4 mt-2 origin-top rounded-2xl border border-border p-3 shadow-elevated md:hidden"
            >
              <motion.ul
                initial="hidden"
                animate="show"
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } } }}
                className="flex flex-col"
              >
                {NAV_ITEMS.map(({ id, label }) => (
                  <motion.li
                    key={id}
                    variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } }}
                  >
                    <SectionLink
                      id={id}
                      onClick={() => setMenuOpen(false)}
                      aria-current={active === id ? 'true' : undefined}
                      className={`flex items-center justify-between rounded-xl px-4 py-3 text-base font-medium transition-colors ${
                        active === id
                          ? 'bg-primary/10 text-text'
                          : 'text-text-secondary hover:bg-surface-elevated hover:text-text'
                      }`}
                    >
                      {label}
                      {active === id && <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-primary" />}
                    </SectionLink>
                  </motion.li>
                ))}
              </motion.ul>
              <div className="mt-2 border-t border-border pt-3">
                <Button
                  href="#get-started"
                  icon={ArrowRight}
                  className="w-full"
                  onClick={() => setMenuOpen(false)}
                >
                  Get Started
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
