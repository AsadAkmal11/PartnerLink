import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { BadgeCheck, Compass, FileSearch } from 'lucide-react';
import SectionHeading from '../common/SectionHeading.jsx';
import { DEMO_FACULTY, FACULTY_DOMAINS } from '../../data/landing.js';
import { EASE_OUT, fadeUp, stagger, viewportOnce } from '../../lib/motion.js';

const HIGHLIGHTS = [
  { icon: Compass, title: 'Browse by domain', text: 'Narrow faculty to the research area your project lives in.' },
  { icon: BadgeCheck, title: 'Vetted profiles', text: 'Faculty appear only after admin approval.' },
  { icon: FileSearch, title: 'Align early', text: 'Match your idea with a supervisor before you commit.' },
];

function FacultyCard({ faculty }) {
  const { name, department, areas, domain } = faculty;
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.35, ease: EASE_OUT }}
      className="group flex w-full flex-col border-b border-border/80 py-5 last:border-b-0 sm:w-[calc(50%-1rem)] sm:border-b-0 sm:border-l sm:border-border/80 sm:px-6 sm:first:border-l-0 lg:w-[calc(25%-1.2rem)]"
    >
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary-highlight">
        {domain}
      </p>
      <h3 className="heading-card mt-3">{name}</h3>
      <p className="mt-1 text-sm text-text-muted">{department}</p>
      <ul className="mt-5 space-y-1.5">
        {areas.map((area) => (
          <li key={area} className="text-sm text-text-secondary">
            <span className="mr-2 inline-block h-1 w-1 rounded-full bg-primary/70" aria-hidden="true" />
            {area}
          </li>
        ))}
      </ul>
    </motion.article>
  );
}

export default function FacultyPreview() {
  const [domain, setDomain] = useState('All');
  const visible = domain === 'All' ? DEMO_FACULTY : DEMO_FACULTY.filter((f) => f.domain === domain);

  return (
    <section
      id="faculty"
      aria-labelledby="faculty-heading"
      className="relative overflow-hidden border-y border-border/60 bg-surface/30 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          id="faculty-heading"
          eyebrow="Faculty discovery"
          title={
            <>
              Supervisors who <em className="italic text-gold-gradient">fit</em> your idea
            </>
          }
          description="Explore faculty by research domain — clean, minimal profiles so the work stands out."
        />

        <motion.ul
          variants={stagger(0.08)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-3"
        >
          {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
            <motion.li key={title} variants={fadeUp} className="text-center sm:text-left">
              <span className="glass-pill inline-flex h-10 w-10 items-center justify-center text-primary-highlight">
                <Icon size={18} aria-hidden="true" />
              </span>
              <h3 className="mt-3 text-sm font-semibold text-text">{title}</h3>
              <p className="mt-1 text-sm text-text-muted">{text}</p>
            </motion.li>
          ))}
        </motion.ul>

        <div className="mt-12 flex flex-wrap justify-center gap-2">
          {FACULTY_DOMAINS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDomain(d)}
              className={`rounded-[10px] px-3.5 py-2 text-sm font-medium transition-all ${
                domain === d
                  ? 'bg-primary text-on-primary'
                  : 'glass-pill text-text-secondary hover:text-text'
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-y-2 sm:gap-0">
          <AnimatePresence mode="popLayout">
            {visible.map((faculty) => (
              <FacultyCard key={faculty.id} faculty={faculty} />
            ))}
          </AnimatePresence>
        </div>

        <p className="mt-10 text-center text-xs text-text-muted">
          Fictional examples for demonstration — not real GIKI faculty listings.
        </p>
      </div>
    </section>
  );
}
