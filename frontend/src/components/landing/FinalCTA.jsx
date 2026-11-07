import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import AnimatedSection from '../common/AnimatedSection.jsx';
import Button from '../common/Button.jsx';
import { fadeUp, scaleIn, stagger } from '../../lib/motion.js';

export default function FinalCTA() {
  return (
    <AnimatedSection id="get-started" aria-labelledby="cta-heading" className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <motion.div
          variants={scaleIn}
          className="gold-hairline relative isolate overflow-hidden rounded-[2rem] border border-primary/25 bg-surface-elevated px-6 py-16 text-center shadow-elevated sm:px-12 sm:py-20"
        >
          {/* Restrained gold light */}
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-0 -z-10 h-80 w-[44rem] max-w-[160%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
            style={{ background: 'radial-gradient(closest-side, color-mix(in oklab, var(--color-primary) 30%, transparent), transparent)' }}
          />
          <div aria-hidden="true" className="bg-grid absolute inset-0 -z-10 opacity-50" />

          <motion.div variants={stagger(0.1, 0.25)} className="mx-auto flex max-w-2xl flex-col items-center">
            <motion.span
              variants={fadeUp}
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/35 bg-primary/10 text-primary-highlight"
            >
              <Sparkles size={22} aria-hidden="true" />
            </motion.span>
            <motion.h2 variants={fadeUp} id="cta-heading" className="heading-section mt-6 text-balance">
              Start your FYP with the <span className="text-gold-gradient">right people</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lead mt-5 text-pretty">
              PartnerLink is in active development for GIKI students. Student registration is coming soon — until then,
              explore how discovery works and see what your profile will include.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-9 flex flex-wrap justify-center gap-3">
              <Button href="#how-it-works" size="lg" icon={ArrowRight}>
                Review the steps
              </Button>
              <Button href="#discover" size="lg" variant="secondary">
                Try the discovery preview
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </AnimatedSection>
  );
}
