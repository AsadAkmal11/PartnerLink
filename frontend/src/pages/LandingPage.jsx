import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Hero from '../components/landing/Hero.jsx';
import Features from '../components/landing/Features.jsx';
import HowItWorks from '../components/landing/HowItWorks.jsx';
import DiscoveryPreview from '../components/landing/DiscoveryPreview.jsx';
import FacultyPreview from '../components/landing/FacultyPreview.jsx';
import FinalCTA from '../components/landing/FinalCTA.jsx';

export default function LandingPage() {
  const { hash } = useLocation();

  // When arriving from another route (e.g. /#features), scroll to the section
  // once it has rendered. Same-page anchors are handled natively by the browser.
  useEffect(() => {
    if (!hash) return undefined;
    const el = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (!el) return undefined;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let cancelled = false;
    // Wait for web fonts so text reflow doesn't move the target mid-scroll.
    const fontsReady = document.fonts?.ready ?? Promise.resolve();
    fontsReady.then(() => {
      if (!cancelled) {
        requestAnimationFrame(() => el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [hash]);

  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <DiscoveryPreview />
      <FacultyPreview />
      <FinalCTA />
    </>
  );
}
