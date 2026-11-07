import { motion } from 'motion/react';
import { Compass, Home } from 'lucide-react';
import Button from '../components/common/Button.jsx';
import BackgroundGlow from '../components/landing/BackgroundGlow.jsx';
import { fadeUp, stagger } from '../lib/motion.js';
import { ROUTES } from '../routes/paths.js';

export default function NotFoundPage() {
  return (
    <section className="relative isolate flex min-h-[80vh] items-center overflow-hidden px-5 pb-20 pt-36">
      <BackgroundGlow />
      <motion.div
        variants={stagger(0.1)}
        initial="hidden"
        animate="show"
        className="mx-auto flex max-w-xl flex-col items-center text-center"
      >
        <motion.span variants={fadeUp} className="font-display text-8xl font-extrabold text-gold-gradient sm:text-9xl">
          404
        </motion.span>
        <motion.h1 variants={fadeUp} className="heading-section mt-4">
          Page not found
        </motion.h1>
        <motion.p variants={fadeUp} className="text-lead mt-4">
          This page doesn&apos;t exist yet. More of PartnerLink is on the way.
        </motion.p>
        <motion.div variants={fadeUp} className="mt-9 flex flex-wrap justify-center gap-3">
          <Button to={ROUTES.HOME} size="lg" icon={Home} iconPosition="left">
            Back to home
          </Button>
          <Button href="#features" size="lg" variant="secondary" icon={Compass} iconPosition="left">
            Explore features
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
