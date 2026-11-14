import { useState } from 'react';
import { ArrowRight, Maximize2, Minimize2 } from 'lucide-react';
import Button from '../common/Button.jsx';
import { ROUTES } from '../../routes/paths.js';

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260210_031346_d87182fb-b0af-4273-84d1-c6fd17d6bf0f.mp4';

export default function Hero() {
  const [fullBleed, setFullBleed] = useState(true);

  return (
    <section
      id="home"
      aria-labelledby="hero-heading"
      className={`relative w-full overflow-hidden transition-all duration-500 ease-in-out ${
        fullBleed ? 'min-h-screen' : 'pb-28 pt-28 lg:pb-36 lg:pt-36'
      }`}
    >
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 z-0 h-full w-full object-cover"
      >
        <source src={VIDEO_URL} type="video/mp4" />
      </video>

      {/* Readability scrim */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[1]"
        style={{
          background:
            'linear-gradient(180deg, rgb(7 7 10 / 0.55) 0%, rgb(7 7 10 / 0.35) 40%, rgb(7 7 10 / 0.72) 100%)',
        }}
      />

      <button
        type="button"
        onClick={() => setFullBleed((v) => !v)}
        aria-label={fullBleed ? 'Switch to fit-to-content' : 'Switch to full-bleed'}
        className="glass-pill absolute top-24 right-4 z-20 p-2.5 text-text transition-all hover:brightness-125 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:top-28 lg:right-8"
      >
        {fullBleed ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
      </button>

      <div
        className={`relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 text-center ${
          fullBleed ? 'min-h-screen justify-center pb-16 pt-28' : 'mt-8'
        }`}
      >
        <div className="glass-pill inline-flex h-[38px] items-center gap-2.5 px-3.5">
          <span className="rounded-md bg-primary px-2.5 py-1 text-xs font-semibold text-on-primary shadow-[0_0_8px_rgba(212,168,83,0.4)]">
            New
          </span>
          <span className="text-sm font-medium tracking-wide text-text">
            PartnerLink for GIKI FYP teams
          </span>
        </div>

        <h1 id="hero-heading" className="heading-hero mt-8 max-w-5xl text-balance">
          Find your perfect FYP partners
          <br className="hidden lg:block" />{' '}
          <em className="italic text-gold-gradient">and</em> start building
        </h1>

        <p className="text-lead mt-6 max-w-[40rem] text-pretty">
          Match with classmates by skills, research interests and academic fit — then discover
          approved faculty supervisors who align with your project.
        </p>

        <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
          <Button to={ROUTES.REGISTER} size="lg" icon={ArrowRight}>
            Get started
          </Button>
          <Button to={ROUTES.LOGIN} size="lg" variant="secondary">
            Sign in
          </Button>
        </div>
      </div>
    </section>
  );
}
