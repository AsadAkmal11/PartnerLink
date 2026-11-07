import { Fragment } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, PlayCircle, ShieldCheck } from 'lucide-react';
import Button from '../common/Button.jsx';
import BackgroundGlow from './BackgroundGlow.jsx';
import HeroVisual from './HeroVisual.jsx';
import { fadeUp, stagger, wordReveal } from '../../lib/motion.js';

/* Headline split into words so each can rise in turn; `gold` words get the accent. */
const HEADLINE = [
  { text: 'Find' },
  { text: 'the' },
  { text: 'right' },
  { text: 'partners', gold: true },
  { text: 'for' },
  { text: 'your' },
  { text: 'Final', gold: true },
  { text: 'Year', gold: true },
  { text: 'Project.', gold: true },
];

export default function Hero() {
  return (
    <section
      id="home"
      aria-labelledby="hero-heading"
      className="relative isolate overflow-hidden pt-32 pb-24 sm:pt-36 lg:pb-32 lg:pt-40"
    >
      <BackgroundGlow />

      <div className="mx-auto grid max-w-7xl items-center gap-20 px-5 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
        {/* Copy */}
        <motion.div
          variants={stagger(0.12, 0.1)}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center text-center lg:items-start lg:text-left"
        >
          <motion.p
            variants={fadeUp}
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary-highlight"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-soft-pulse" aria-hidden="true" />
            Built exclusively for GIKI students
          </motion.p>

          <motion.h1
            id="hero-heading"
            variants={stagger(0.06, 0.1)}
            className="heading-hero mt-7 max-w-[14ch] text-balance sm:max-w-[16ch]"
          >
            {HEADLINE.map((word, i) => (
              <Fragment key={i}>
                <span className="inline-block overflow-hidden pb-[0.12em] align-bottom">
                  <motion.span
                    variants={wordReveal}
                    className={`inline-block ${word.gold ? 'text-gold-gradient' : ''}`}
                  >
                    {word.text}
                  </motion.span>
                </span>
                {i < HEADLINE.length - 1 && ' '}
              </Fragment>
            ))}
          </motion.h1>

          <motion.p variants={fadeUp} className="text-lead mt-6 max-w-xl text-pretty">
            PartnerLink helps you discover classmates with complementary skills, shared research interests
            and compatible academic goals — so your FYP team is built on the right foundation from day one.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-9 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <Button href="#discover" size="lg" icon={ArrowRight}>
              Explore discovery
            </Button>
            <Button href="#how-it-works" size="lg" variant="secondary" icon={PlayCircle} iconPosition="left">
              See how it works
            </Button>
          </motion.div>

          <motion.p variants={fadeUp} className="mt-8 inline-flex items-center gap-2 text-sm text-text-muted">
            <ShieldCheck size={16} className="text-primary-highlight" aria-hidden="true" />
            Designed around verified GIKI accounts and vetted faculty profiles.
          </motion.p>
        </motion.div>

        {/* Product preview */}
        <div className="px-2 sm:px-6 lg:px-0">
          <HeroVisual />
        </div>
      </div>
    </section>
  );
}
