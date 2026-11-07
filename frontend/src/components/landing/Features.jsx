import { motion } from 'motion/react';
import SectionHeading from '../common/SectionHeading.jsx';
import FeatureCard from './FeatureCard.jsx';
import { FEATURES } from '../../data/landing.js';
import { stagger, viewportOnce } from '../../lib/motion.js';

export default function Features() {
  return (
    <section id="features" aria-labelledby="features-heading" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          id="features-heading"
          eyebrow="Features"
          title={
            <>
              Everything you need to build a <span className="text-gold-gradient">stronger FYP team</span>
            </>
          }
          description="PartnerLink brings profiles, discovery and faculty information together in one focused place — designed around how GIKI students actually form project groups."
        />

        <motion.div
          variants={stagger(0.09)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.title} index={i} {...feature} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
