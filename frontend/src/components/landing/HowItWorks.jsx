import { motion } from 'motion/react';
import SectionHeading from '../common/SectionHeading.jsx';
import StepCard from './StepCard.jsx';
import { STEPS } from '../../data/landing.js';
import { stagger } from '../../lib/motion.js';

const lineTransition = { duration: 1.4, ease: [0.65, 0, 0.35, 1], delay: 0.2 };

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-heading"
      className="relative overflow-hidden border-y border-border bg-surface/40 py-24 sm:py-32"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-72 w-[40rem] -translate-x-1/2 rounded-full opacity-60 blur-3xl"
        style={{ background: 'radial-gradient(closest-side, color-mix(in oklab, var(--color-primary) 12%, transparent), transparent)' }}
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          id="how-heading"
          eyebrow="How it works"
          title="From profile to project team in three steps"
          description="A simple flow that keeps the focus on finding people you will genuinely work well with."
        />

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className="relative mt-16 md:mt-20"
        >
          {/* Connecting line — vertical on mobile, horizontal on desktop */}
          <div aria-hidden="true" className="absolute bottom-10 left-7 top-7 w-px bg-border md:hidden">
            <motion.div
              variants={{ hidden: { scaleY: 0 }, show: { scaleY: 1, transition: lineTransition } }}
              className="h-full w-full origin-top bg-gradient-to-b from-primary via-primary/60 to-transparent"
            />
          </div>
          <div aria-hidden="true" className="absolute left-[16.66%] right-[16.66%] top-7 hidden h-px bg-border md:block">
            <motion.div
              variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: lineTransition } }}
              className="h-full w-full origin-left bg-gradient-to-r from-primary via-primary-highlight to-primary"
            />
          </div>

          <motion.ol variants={stagger(0.22, 0.1)} className="relative grid gap-10 md:grid-cols-3 md:gap-8">
            {STEPS.map((step, i) => (
              <StepCard key={step.title} step={step} index={i} />
            ))}
          </motion.ol>
        </motion.div>
      </div>
    </section>
  );
}
