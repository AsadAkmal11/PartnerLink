import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { Users, BookOpen, Lightbulb, Star } from 'lucide-react';
import Badge from '../components/common/Badge.jsx';
import Card from '../components/common/Card.jsx';

/* ── Motion variants ─────────────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show:   { opacity: 1, y: 0,  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.7 } },
};

const stagger = (delay = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren: 0.11, delayChildren: delay } },
});

/* ── Data ────────────────────────────────────────────────────────────────── */
const features = [
  {
    icon: Users,
    title: 'Smart Partner Matching',
    description:
      'An algorithm that surfaces peers whose skills and research interests complement yours — not just duplicate them.',
  },
  {
    icon: BookOpen,
    title: 'Faculty Discovery',
    description:
      'Browse vetted GIKI faculty, explore their research domains, and find the right advisor for your FYP.',
  },
  {
    icon: Lightbulb,
    title: 'FYP Project Archive',
    description:
      'Draw inspiration from previous Final Year Projects and the technologies that powered them.',
  },
  {
    icon: Star,
    title: 'Ranked Recommendations',
    description:
      'Ranked lists so you spend less time searching and more time building something extraordinary.',
  },
];

const skills = [
  'Machine Learning', 'Web Dev', 'IoT', 'Computer Vision',
  'NLP', 'Embedded Systems', 'Cloud', 'Cybersecurity',
  'Robotics', 'Data Science',
];

const stats = [
  { value: '4', label: 'Max team size' },
  { value: '3', label: 'Advisor slots' },
  { value: '∞', label: 'Co-advisor slots' },
];

/* ── Floating particle dots (pure CSS animation via inline style) ───────── */
function Particle({ style }) {
  return (
    <motion.div
      className="absolute rounded-full bg-cream-100/5"
      animate={{ y: [0, -18, 0], opacity: [0.3, 0.7, 0.3] }}
      transition={{ duration: style.dur, repeat: Infinity, delay: style.delay, ease: 'easeInOut' }}
      style={{
        width:  style.size,
        height: style.size,
        left:   style.left,
        top:    style.top,
      }}
    />
  );
}

const particles = [
  { size: 6,  left: '8%',  top: '20%', dur: 4,   delay: 0    },
  { size: 4,  left: '18%', top: '65%', dur: 5,   delay: 1    },
  { size: 8,  left: '75%', top: '12%', dur: 3.5, delay: 0.5  },
  { size: 5,  left: '85%', top: '50%', dur: 4.5, delay: 1.5  },
  { size: 7,  left: '55%', top: '78%', dur: 6,   delay: 2    },
  { size: 3,  left: '40%', top: '90%', dur: 4,   delay: 0.8  },
  { size: 5,  left: '92%', top: '30%', dur: 5.5, delay: 2.5  },
  { size: 6,  left: '28%', top: '40%', dur: 3.8, delay: 1.2  },
];

/* ── Component ───────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY   = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const heroOp  = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <div className="relative overflow-hidden">

      {/* ── Background glow blobs ────────────────────────────────────────── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Top-centre blob */}
        <div className="absolute -top-48 left-1/2 h-[560px] w-[720px] -translate-x-1/2 rounded-full bg-navy-700/40 blur-[130px]" />
        {/* Bottom-right accent */}
        <div className="absolute top-[55%] -right-32 h-[400px] w-[500px] rounded-full bg-cream-100/5 blur-[110px]" />
        {/* Bottom-left */}
        <div className="absolute top-[70%] -left-20 h-[300px] w-[380px] rounded-full bg-navy-700/30 blur-[90px]" />
      </div>

      {/* ── Floating particles ───────────────────────────────────────────── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {particles.map((p, i) => <Particle key={i} style={p} />)}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative mx-auto max-w-6xl px-6 pt-28 pb-24 text-center"
      >
        <motion.div style={{ y: heroY, opacity: heroOp }}>
          <motion.div
            variants={stagger(0)}
            initial="hidden"
            animate="show"
            className="flex flex-col items-center"
          >
            {/* Live pill */}
            <motion.div variants={fadeUp} className="mb-7">
              <span className="inline-flex items-center gap-2 rounded-full border border-cream-100/20 bg-navy-900/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-cream-200/80 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-cream-400 animate-soft-pulse" />
                GIKI — Final Year Projects
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight text-cream-100 sm:text-5xl md:text-[3.75rem]"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              Find your{' '}
              <span
                className="animate-shimmer bg-gradient-to-r from-cream-100 via-cream-400 to-cream-100 bg-clip-text text-transparent"
              >
                perfect FYP team
              </span>
              <br className="hidden sm:block" />
              before the semester starts.
            </motion.h1>

            {/* Sub-headline */}
            <motion.p
              variants={fadeUp}
              className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-cream-200/60 sm:text-lg"
            >
              PartnerLink matches GIKI students by skills, research interests,
              and academic goals — so every Final Year Project begins with the
              right people.
            </motion.p>

            {/* CTA row */}
            <motion.div
              variants={fadeUp}
              className="mt-10 flex flex-wrap items-center justify-center gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: '0 0 32px rgba(252,241,208,0.15)' }}
                whileTap={{ scale: 0.97 }}
                className="rounded-xl bg-cream-100 px-7 py-3 text-sm font-bold text-navy-950 shadow-lg transition-colors hover:bg-cream-200"
              >
                Get started — it&apos;s free
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="rounded-xl border border-navy-700 bg-navy-900/60 px-7 py-3 text-sm font-semibold text-cream-100/80 backdrop-blur-sm transition-colors hover:border-cream-100/30 hover:text-cream-100"
              >
                See how it works
              </motion.button>
            </motion.div>

            {/* Skill badge cloud */}
            <motion.div
              variants={stagger(0.4)}
              initial="hidden"
              animate="show"
              className="mt-14 flex flex-wrap justify-center gap-2"
            >
              {skills.map((skill, i) => (
                <motion.div
                  key={skill}
                  variants={fadeIn}
                  whileHover={{ scale: 1.1, y: -3 }}
                  transition={{ type: 'spring', stiffness: 320 }}
                >
                  <Badge variant={i % 3 === 1 ? 'gold' : i % 3 === 2 ? 'cream' : 'default'}>
                    {skill}
                  </Badge>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          STATS STRIP
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative border-y border-navy-700/50 bg-navy-900/50 backdrop-blur-sm py-10">
        <motion.div
          variants={stagger(0)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="mx-auto flex max-w-3xl flex-wrap justify-around gap-8 px-6"
        >
          {stats.map(({ value, label }) => (
            <motion.div
              key={label}
              variants={fadeUp}
              className="flex flex-col items-center gap-1"
            >
              <span
                className="text-4xl font-extrabold text-cream-100"
                style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              >
                {value}
              </span>
              <span className="text-xs uppercase tracking-widest text-cream-200/50">
                {label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          FEATURES GRID
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative mx-auto max-w-6xl px-6 py-28">
        {/* Section header */}
        <motion.div
          variants={stagger(0)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="mb-14 text-center"
        >
          <motion.p variants={fadeUp} className="mb-3 text-xs uppercase tracking-widest text-cream-400/70 font-semibold">
            What PartnerLink does
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="text-3xl font-bold text-cream-100 sm:text-4xl"
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            Everything you need to find your team
          </motion.h2>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={stagger(0)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {features.map(({ icon: Icon, title, description }, idx) => (
            <motion.div
              key={title}
              variants={fadeUp}
              custom={idx}
              whileHover={{ y: -6, transition: { type: 'spring', stiffness: 300 } }}
            >
              <Card className="h-full flex flex-col gap-4 group cursor-default hover:border-cream-100/20 transition-colors duration-300">
                {/* Icon badge */}
                <motion.span
                  whileHover={{ rotate: 8, scale: 1.1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-700/60 text-cream-400 border border-navy-700 group-hover:bg-navy-700 group-hover:text-cream-100 transition-colors"
                >
                  <Icon size={20} />
                </motion.span>

                <div>
                  <h3
                    className="mb-1.5 text-sm font-semibold text-cream-100"
                    style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                  >
                    {title}
                  </h3>
                  <p className="text-xs leading-relaxed text-cream-200/50">
                    {description}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════════════════════════ */}
      <footer className="border-t border-navy-700/40 py-8 text-center text-xs text-cream-200/25">
        Developed with ❤️ for the GIKI Software Engineering Course &mdash; prototype only.
      </footer>
    </div>
  );
}
