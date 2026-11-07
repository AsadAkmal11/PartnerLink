import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { BadgeCheck, Building2, Compass, FileSearch, Info } from 'lucide-react';
import Badge from '../common/Badge.jsx';
import SectionHeading from '../common/SectionHeading.jsx';
import { DEMO_FACULTY, FACULTY_DOMAINS } from '../../data/landing.js';
import { EASE_OUT, fadeUp, stagger, viewportOnce } from '../../lib/motion.js';

const HIGHLIGHTS = [
  { icon: Compass, title: 'Browse by research domain', text: 'Narrow faculty down to the area your project lives in.' },
  { icon: BadgeCheck, title: 'Vetted profiles', text: 'Faculty profiles are reviewed before students can see them.' },
  { icon: FileSearch, title: 'Find a supervisor early', text: 'Align your idea with a supervisor’s research before you commit.' },
];

function FacultyCard({ faculty }) {
  const { icon: Icon, name, department, areas, domain } = faculty;
  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.96, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: -8 }}
      transition={{ duration: 0.4, ease: EASE_OUT }}
      className="group relative flex w-full flex-col rounded-2xl border border-border bg-surface p-6 shadow-card sm:w-[calc(50%-0.5rem)] lg:w-[calc(25%-0.75rem)] transition-[border-color,box-shadow] duration-500 hover:border-primary/40 hover:shadow-elevated"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-surface-elevated text-primary-highlight transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-105">
          <Icon size={21} strokeWidth={1.8} aria-hidden="true" />
        </span>
        <Badge size="sm" variant="outline">Fictional example</Badge>
      </div>
      <h3 className="heading-card mt-5">{name}</h3>
      <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-text-muted">
        <Building2 size={14} aria-hidden="true" />
        {department}
      </p>
      <p className="mt-4 text-[0.6875rem] font-semibold uppercase tracking-wider text-text-muted">{domain}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {areas.map((area) => (
          <Badge key={area} variant="default">
            {area}
          </Badge>
        ))}
      </div>
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
      className="relative overflow-hidden border-y border-border bg-surface/40 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          id="faculty-heading"
          eyebrow="Faculty discovery"
          title={
            <>
              Find a supervisor who <span className="text-gold-gradient">fits your idea</span>
            </>
          }
          description="Explore faculty by research domain and get a clear view of their areas of work before you approach them."
        />

        <motion.ul
          variants={stagger(0.1)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mx-auto mt-14 grid max-w-5xl gap-4 sm:grid-cols-3"
        >
          {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
            <motion.li key={title} variants={fadeUp} className="flex gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary-highlight">
                <Icon size={18} aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold text-text">{title}</p>
                <p className="mt-1 text-sm leading-relaxed text-text-muted">{text}</p>
              </div>
            </motion.li>
          ))}
        </motion.ul>

        {/* Domain filter */}
        <div className="mt-14 flex flex-col items-center gap-4">
          <div
            role="group"
            aria-label="Filter example faculty by domain"
            className="flex max-w-full gap-1 overflow-x-auto rounded-full border border-border bg-surface p-1"
          >
            {FACULTY_DOMAINS.map((d) => {
              const active = d === domain;
              return (
                <button
                  key={d}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setDomain(d)}
                  className={`relative shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300 ${
                    active ? 'text-text' : 'text-text-muted hover:text-text'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="faculty-domain-pill"
                      transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                      className="absolute inset-0 rounded-full border border-primary/30 bg-primary/10"
                    />
                  )}
                  <span className="relative">{d}</span>
                </button>
              );
            })}
          </div>
          <p className="inline-flex items-center gap-2 text-center text-sm text-text-muted">
            <Info size={15} className="shrink-0 text-primary-highlight" aria-hidden="true" />
            Fictional faculty shown for demonstration. No real GIKI faculty information is displayed.
          </p>
        </div>

        <motion.div layout className="mt-8 flex flex-wrap justify-center gap-4">
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((faculty) => (
              <FacultyCard key={faculty.id} faculty={faculty} />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
