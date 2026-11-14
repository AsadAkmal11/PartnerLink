import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import SectionHeading from '../common/SectionHeading.jsx';
import Button from '../common/Button.jsx';
import ErrorBoundary from '../common/ErrorBoundary.jsx';
import TeamLanyardRail from '../viz/TeamLanyardRail.jsx';
import BarRaceChart from '../viz/BarRaceChart.jsx';
import { DEMO_LANYARD_MEMBERS, DEMO_MATCH_BARS } from '../../data/landing.js';
import { ROUTES } from '../../routes/paths.js';

export default function DiscoveryPreview() {
  return (
    <section id="discover" aria-labelledby="discover-heading" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          id="discover-heading"
          eyebrow="Discovery preview"
          title={
            <>
              Meet teammates who <em className="italic text-gold-gradient">fit</em> your direction
            </>
          }
          description="Flip a badge to peek at skills and interests. The race chart ranks fictional compatibility scores — the live app uses the same idea with real profiles."
        />
      </div>

      <div className="mt-10">
        <ErrorBoundary>
          <TeamLanyardRail
            items={DEMO_LANYARD_MEMBERS}
            eyebrow="Top matching profiles"
            heading="Hang out with your shortlist"
            caption="Hover or tap a badge · click to flip"
            autoplay
            className="bg-transparent"
            action={
              <Button to={ROUTES.REGISTER} size="sm" icon={ArrowRight} className="mt-1">
                Build your profile
              </Button>
            }
          />
        </ErrorBoundary>
      </div>

      <div className="mx-auto mt-6 max-w-3xl px-5 sm:px-8">
        <div className="glass-pill rounded-2xl p-5 sm:p-6">
          <ErrorBoundary>
            <BarRaceChart
              data={DEMO_MATCH_BARS}
              topN={4}
              duration={700}
              caption="Best match scores"
              period="Demo · fictional"
              formatValue={(v) => `${Math.round(v)}%`}
              max={100}
            />
          </ErrorBoundary>
          <p className="mt-4 text-center text-xs text-text-muted">
            Demonstration only — not live API results.{' '}
            <Link to={ROUTES.LOGIN} className="text-primary hover:underline">
              Sign in
            </Link>{' '}
            to see real recommendations.
          </p>
        </div>
      </div>
    </section>
  );
}
