import { ArrowUp } from 'lucide-react';
import { motion } from 'motion/react';
import Logo from '../common/Logo.jsx';
import SectionLink from '../common/SectionLink.jsx';

const YEAR = new Date().getFullYear();

const PLATFORM_LINKS = [
  { id: 'home', label: 'Home' },
  { id: 'features', label: 'Features' },
  { id: 'how-it-works', label: 'How It Works' },
];

const EXPLORE_LINKS = [
  { id: 'discover', label: 'Discovery preview' },
  { id: 'faculty', label: 'Faculty' },
  { id: 'get-started', label: 'Get Started' },
];

function LinkColumn({ title, links }) {
  return (
    <div>
      <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-text">{title}</h2>
      <ul className="mt-4 space-y-3">
        {links.map(({ id, label }) => (
          <li key={id}>
            <SectionLink id={id} className="text-sm text-text-secondary transition-colors hover:text-primary-highlight">
              {label}
            </SectionLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="relative border-t border-border bg-surface/60">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
      />
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-5 text-sm leading-relaxed text-text-secondary">
              A GIKI-exclusive platform that helps students discover Final Year Project partners and faculty
              supervisors based on skills, interests and academic compatibility.
            </p>
          </div>

          <LinkColumn title="Platform" links={PLATFORM_LINKS} />
          <LinkColumn title="Explore" links={EXPLORE_LINKS} />

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-text">Project</h2>
            <p className="mt-4 text-sm leading-relaxed text-text-secondary">
              Developed as a Software Engineering course project at GIKI. Currently a prototype in active
              development.
            </p>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-center text-sm text-text-muted sm:text-left">
            © {YEAR} PartnerLink. Student prototype — demonstration content is fictional.
          </p>
          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
            <SectionLink
              id="home"
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:border-primary/50 hover:text-text"
            >
              <ArrowUp size={15} aria-hidden="true" />
              Back to top
            </SectionLink>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}
