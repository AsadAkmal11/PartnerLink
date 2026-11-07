import { useMemo, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'motion/react';
import { Check, FlaskConical, Info } from 'lucide-react';
import Avatar from '../common/Avatar.jsx';
import Badge from '../common/Badge.jsx';
import SectionHeading from '../common/SectionHeading.jsx';
import { DEMO_INTERESTS, DEMO_STUDENTS } from '../../data/landing.js';
import { EASE_OUT, fadeUp, stagger, viewportOnce } from '../../lib/motion.js';

const OVERLAP_LABEL = ['No shared interests selected', 'Some shared interest', 'Strong interest overlap'];

function DemoStudentCard({ student, selected }) {
  const shared = student.interests.filter((interest) => selected.includes(interest));
  const level = Math.min(shared.length, 2);

  return (
    <article
      className={`relative flex h-full flex-col rounded-2xl border bg-surface p-5 shadow-card transition-colors duration-500 ${
        level > 0 ? 'border-primary/40' : 'border-border'
      }`}
    >
      <div className="flex items-start gap-3">
        <Avatar name={student.name} tone={student.tone} size="lg" />
        <div className="min-w-0 flex-1">
          <h3 className="heading-card truncate text-base">{student.name}</h3>
          <p className="truncate text-sm text-text-muted">{student.program}</p>
        </div>
        <Badge size="sm" variant="outline">Fictional</Badge>
      </div>

      <div className="mt-5">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-text-muted">Skills</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {student.skills.map((skill) => (
            <Badge key={skill}>{skill}</Badge>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-text-muted">Research interests</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {student.interests.map((interest) => (
            <Badge key={interest} variant={shared.includes(interest) ? 'gold' : 'muted'} icon={shared.includes(interest) ? Check : undefined}>
              {interest}
            </Badge>
          ))}
        </div>
      </div>

      {/* Example indicator — counts overlap with the selected chips only */}
      <div className="mt-5 border-t border-border pt-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-medium text-text-secondary">{OVERLAP_LABEL[level]}</p>
          <span className="text-[0.6875rem] text-text-muted">Example indicator</span>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-1.5" aria-hidden="true">
          {[0, 1].map((i) => (
            <span key={i} className="h-1.5 overflow-hidden rounded-full bg-border/70">
              <motion.span
                className="block h-full origin-left rounded-full bg-gradient-to-r from-primary to-primary-highlight"
                initial={false}
                animate={{ scaleX: i < level ? 1 : 0 }}
                transition={{ duration: 0.5, ease: EASE_OUT, delay: i * 0.08 }}
              />
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

export default function DiscoveryPreview() {
  const [selected, setSelected] = useState(['Computer Vision', 'Robotics']);

  const toggle = (interest) =>
    setSelected((current) =>
      current.includes(interest) ? current.filter((i) => i !== interest) : [...current, interest],
    );

  // Order by number of shared interests (stable for ties).
  const ordered = useMemo(() => {
    const score = (s) => s.interests.filter((i) => selected.includes(i)).length;
    return DEMO_STUDENTS.map((s, idx) => ({ s, idx, n: score(s) }))
      .sort((a, b) => b.n - a.n || a.idx - b.idx)
      .map(({ s }) => s);
  }, [selected]);

  return (
    <section id="discover" aria-labelledby="discover-heading" className="relative py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        {/* Explanation + interactive controls */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading
            id="discover-heading"
            align="left"
            eyebrow="Discovery preview"
            title="See who shares your direction"
            description="Discovery puts skills and research interests side by side, so complementary teammates stand out. Try it with the fictional profiles here."
          />

          <motion.div
            variants={stagger(0.06)}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="mt-8"
          >
            <motion.p variants={fadeUp} id="interest-picker-label" className="text-sm font-semibold text-text">
              Pick the interests you care about
            </motion.p>
            <motion.div
              variants={fadeUp}
              role="group"
              aria-labelledby="interest-picker-label"
              className="mt-3 flex flex-wrap gap-2"
            >
              {DEMO_INTERESTS.map((interest) => {
                const on = selected.includes(interest);
                return (
                  <motion.button
                    key={interest}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(interest)}
                    whileTap={{ scale: 0.95 }}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors duration-300 ${
                      on
                        ? 'border-primary/50 bg-primary/12 text-primary-highlight'
                        : 'border-border bg-surface text-text-secondary hover:border-primary/40 hover:text-text'
                    }`}
                  >
                    <AnimatePresence initial={false}>
                      {on && (
                        <motion.span
                          initial={{ width: 0, opacity: 0 }}
                          animate={{ width: 'auto', opacity: 1 }}
                          exit={{ width: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex overflow-hidden"
                        >
                          <Check size={14} strokeWidth={2.5} aria-hidden="true" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {interest}
                  </motion.button>
                );
              })}
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="mt-8 flex gap-3 rounded-2xl border border-border bg-surface-elevated/60 p-4"
            >
              <Info size={18} className="mt-0.5 shrink-0 text-primary-highlight" aria-hidden="true" />
              <p className="text-sm leading-relaxed text-text-secondary">
                <strong className="font-semibold text-text">Demonstration only.</strong> These profiles are
                fictional, and the indicators simply count overlap with the interests you selected above. They are
                not real match results.
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* Cards */}
        <div>
          <div className="mb-4 flex items-center gap-2 text-sm text-text-muted">
            <FlaskConical size={15} className="text-primary-highlight" aria-hidden="true" />
            <span aria-live="polite">
              Sample profiles ordered by shared interests ({selected.length} selected)
            </span>
          </div>
          <LayoutGroup>
            <motion.div
              variants={stagger(0.1)}
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
              className="grid gap-4 sm:grid-cols-2"
            >
              {ordered.map((student) => (
                <motion.div
                  key={student.id}
                  variants={fadeUp}
                  layout="position"
                  transition={{ layout: { duration: 0.5, ease: EASE_OUT } }}
                >
                  <DemoStudentCard student={student} selected={selected} />
                </motion.div>
              ))}
            </motion.div>
          </LayoutGroup>
        </div>
      </div>
    </section>
  );
}
