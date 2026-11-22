import { useEffect, useState } from 'react';
import AnimatorTitlePreloader from '../studio/AnimatorTitlePreloader.tsx';
import { Link } from 'react-router-dom';
import { Brand, Button, Mascot, Paint, Pegs, Reveal, Rule, Script, SectionHead, Steps, Trinket } from '../components/ui.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { ROUTES } from '../routes/paths.js';

const INTRO_KEY = 'partnerlink_intro_seen';

const PIPELINE = ['Profile', 'Match', 'Team', 'Supervisor'];

const SKILLS = [
  'Machine Learning',
  'Embedded Systems',
  'Computer Vision',
  'Robotics',
  'NLP',
  'Power Systems',
  'Cybersecurity',
  'IoT',
  'Data Science',
  'Renewable Energy',
  'VLSI',
  'Web & Mobile',
];

const PANELS = [
  {
    pass: 'Rough',
    title: 'Sketch your profile',
    body: 'Sign up with your @giki.edu.pk email, then add your CGPA, the skills you have and the research domains you want to chase.',
    art: (
      <>
        <rect x="18" y="14" width="124" height="72" rx="8" />
        <circle cx="46" cy="42" r="13" />
        <path d="M30 74 C34 62 58 62 62 74" />
        <path d="M76 34 H128 M76 46 H118 M76 58 H124" />
      </>
    ),
  },
  {
    pass: 'Ink',
    title: 'Get ranked matches',
    body: 'Every classmate is scored on skill overlap, shared interests and CGPA fit, so your best teammates rise to the top.',
    art: (
      <>
        <path d="M18 24 H120 M18 44 H96 M18 64 H72" strokeWidth="9" />
        <path d="M128 18 L134 30 L146 31 L137 39 L140 51 L128 45 L117 51 L120 39 L111 31 L123 30 Z" />
      </>
    ),
  },
  {
    pass: 'Paint',
    title: 'Form the team',
    body: 'Browse the directory, filter by skill or domain, and reach out to the people who complete your group.',
    art: (
      <>
        <circle cx="44" cy="50" r="18" />
        <circle cx="80" cy="30" r="18" />
        <circle cx="116" cy="50" r="18" />
        <path d="M60 42 L66 36 M94 36 L100 42 M62 52 H98" />
      </>
    ),
  },
  {
    pass: 'Final',
    title: 'Land a supervisor',
    body: 'Pick from approved faculty and the projects they are offering, or get invited by a professor who found your profile.',
    art: (
      <>
        <path d="M80 14 L144 38 L80 62 L16 38 Z" />
        <path d="M40 48 V70 C56 84 104 84 120 70 V48" />
        <path d="M144 38 V66" />
        <circle cx="144" cy="70" r="4" />
      </>
    ),
  },
];

const WEIGHTS = [
  { k: 'Skill overlap', d: 'Skills you share with a classmate', w: 35, c: 'var(--paint)' },
  { k: 'Shared interests', d: 'Research domains you both want to chase', w: 25, c: '#27e1f2' },
  { k: 'Complementary skills', d: 'Their skills cover the domains you want', w: 15, c: '#ff4a83' },
  { k: 'CGPA fit', d: 'How close your CGPAs are on the 4.0 scale', w: 15, c: '#ffa15a' },
  { k: 'Primary domain', d: 'Same headline research area', w: 10, c: '#fde3c4' },
];

function Sketch() {
  return (
    <svg className="hero-sketch" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeLinecap="round" filter="url(#pl-boil)">
        <path pathLength={1} d="M60 610 C400 604 900 616 1380 606" strokeWidth="1.4" />
        <path pathLength={1} d="M80 380 C500 386 960 372 1360 382" strokeWidth="1.2" style={{ '--d': 200 }} />
        <path
          pathLength={1}
          d="M1180 170 m-90 0 a90 90 0 1 0 180 0 a90 90 0 1 0 -180 0"
          strokeWidth="1.2"
          style={{ '--d': 600 }}
        />
        <path pathLength={1} d="M150 720 L300 820 M150 820 L300 720" strokeWidth="1" stroke="#ff2e88" style={{ '--d': 800 }} />
      </g>
    </svg>
  );
}

function Hero({ signedIn }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % PIPELINE.length), 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="hero wrap">
      <Sketch />
      <Pegs />
      <div className="hero-hud">
        <span className="hud">Sc. 01 — Title card</span>
        <span className="hud">
          FYP season · <b>2026–27</b>
        </span>
      </div>
      <div className="hero-body">
        <div className="crest">
          <img src="/giki.png" alt="GIKI crest" width="108" height="108" />
        </div>
        <div className="hero-kick">
          <Trinket />
          <Script text="Find your FYP team on" seed={12} duration={1500} delay={300} />
          <Trinket className="t2" />
        </div>
        <Paint size="t-hero" d={200}>
          PartnerLink
        </Paint>
        <Script text="made at GIKI" className="s-md s-pink" seed={14} delay={1100} duration={900} flourish />
        <p className="lead rise" style={{ '--d': 700 }}>
          The matchmaker for Final Year Projects at Ghulam Ishaq Khan Institute. Get ranked teammates by skills, research
          interests and CGPA fit — then team up with approved faculty and the projects they are offering.
        </p>
        <div className="hero-cta rise" style={{ '--d': 850 }}>
          {signedIn ? (
            <Button to={ROUTES.DASHBOARD} variant="hot" size="lg" arrow>
              Open your dashboard
            </Button>
          ) : (
            <>
              <Button to={ROUTES.REGISTER} variant="hot" size="lg" arrow>
                Find my team
              </Button>
              <Button to={`${ROUTES.REGISTER}?role=professor`} size="lg">
                I&apos;m faculty
              </Button>
            </>
          )}
        </div>
      </div>
      <div className="hero-foot">
        <Steps items={PIPELINE} at={step} />
        <span className="hud">
          Fr <b>{String((step + 1) * 30).padStart(4, '0')}</b> / 0120
        </span>
      </div>
    </section>
  );
}

export default function LandingPage() {
  const { user } = useAuth();
  const [intro, setIntro] = useState(() => {
    try {
      return sessionStorage.getItem(INTRO_KEY) !== '1';
    } catch {
      return true;
    }
  });
  // The hero waits behind the title card until the iris starts to open.
  const [held, setHeld] = useState(intro);

  useEffect(() => {
    if (!intro) return undefined;
    document.body.classList.add('locked');
    return () => document.body.classList.remove('locked');
  }, [intro]);

  function finishIntro() {
    try {
      sessionStorage.setItem(INTRO_KEY, '1');
    } catch {
      /* private mode: the intro simply plays again next time */
    }
    setIntro(false);
    setHeld(false);
  }

  return (
    <div className="shell">
      {intro && (
        <div className="intro">
          <AnimatorTitlePreloader
            height="100svh"
            preset="ember"
            palette={{ word0: '#fde3c4', word1: '#fde3c4', word2: '#fde3c4' }}
            kicker="Find your FYP team on"
            title="PartnerLink"
            connector="made at"
            name="GIKI"
            meta="FYP season · 2026–27"
            scene="Sc. 01 — GIKI, Topi"
            label="Loading PartnerLink"
            durationMs={5200}
            onComplete={finishIntro}
          />
        </div>
      )}

      <a href="#main" className="skip">
        Skip to content
      </a>
      <header className="top">
        <div className="wrap top-in">
          <Brand />
          <nav className="nav" aria-label="Primary">
            <a href="#how">How it works</a>
            <a href="#engine">The engine</a>
            <a href="#roles">Who it&apos;s for</a>
          </nav>
          <div className="top-r">
            {user ? (
              <Button to={ROUTES.DASHBOARD} variant="solid" size="sm" arrow>
                Open app
              </Button>
            ) : (
              <>
                <Button to={ROUTES.LOGIN} size="sm" className="btn-ghost-hide">
                  Sign in
                </Button>
                <Button to={ROUTES.REGISTER} variant="solid" size="sm" arrow>
                  Get started
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main id="main">
        {held ? <section className="hero" aria-hidden="true" /> : <Hero signedIn={Boolean(user)} />}

        <div className="ticker" aria-hidden="true">
          <div className="ticker-in">
            {[...SKILLS, ...SKILLS].map((s, i) => (
              <span key={i}>{s}</span>
            ))}
          </div>
        </div>

        <section id="how" className="wrap section" style={{ scrollMarginTop: 96 }}>
          <Rule />
          <SectionHead script="how it works" title="Four passes, one FYP team." seed={21}>
            <span className="hud">Rough · Ink · Paint · Final</span>
          </SectionHead>
          <div className="board">
            {PANELS.map((p, i) => (
              <Reveal key={p.pass} className="cel panel" d={i * 110}>
                <span className="cel-tl hud">Pass {String(i + 1).padStart(2, '0')}</span>
                <span className="cel-no hud">{p.pass}</span>
                <div className="panel-art">
                  <svg viewBox="0 0 160 90" aria-hidden="true">
                    <g
                      filter="url(#pl-boil)"
                      fill="none"
                      stroke={['#27e1f2', '#f8bd8a', '#ff4a83', '#ffa15a'][i]}
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {p.art}
                    </g>
                  </svg>
                </div>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="engine" className="wrap section" style={{ scrollMarginTop: 96 }}>
          <Rule />
          <div className="sheet">
            <div>
              <Script text="what the engine weighs" className="s-md s-cyan" seed={31} />
              <Paint as="h2" size="t-section">
                {'Skills.\nInterests.\nFit.'}
              </Paint>
              <p className="lead" style={{ marginTop: 22 }}>
                Every time a profile changes, PartnerLink re-scores each pair of students and stores the result, so your
                recommendations are always current.
              </p>
            </div>
            <Reveal className="cel sheet-rows">
              <span className="cel-tl hud">Exposure sheet</span>
              <span className="cel-no hud">Σ = 100</span>
              {WEIGHTS.map((r, i) => (
                <div className="sheet-row" key={r.k}>
                  <div>
                    <b>{r.k}</b>
                    <small>{r.d}</small>
                  </div>
                  <span className="bar-v">{r.w}%</span>
                  <span className="bar-track" aria-hidden="true">
                    <i className="bar-fill" style={{ '--w': `${r.w * 2.4}%`, '--c': r.c, '--n': i }} />
                  </span>
                </div>
              ))}
            </Reveal>
          </div>
        </section>

        <section id="roles" className="wrap section" style={{ scrollMarginTop: 96 }}>
          <Rule />
          <SectionHead script="who it's for" title="Three seats in the studio." seed={41} />
          <div className="roles">
            <Reveal className="cel cel-hot role" d={0}>
              <span className="cel-tl hud">Seat 01</span>
              <span className="cel-no hud">Most popular</span>
              <Script text="Students" className="s-lg s-peach" seed={42} />
              <ul style={{ '--c': '#f3672f' }}>
                <li>Ranked teammate recommendations</li>
                <li>Directory filtered by skill and domain</li>
                <li>Every open FYP project from faculty</li>
              </ul>
              <Button to={ROUTES.REGISTER} variant="hot" arrow>
                Create student account
              </Button>
            </Reveal>
            <Reveal className="cel cel-cyan role" d={120}>
              <span className="cel-tl hud">Seat 02</span>
              <span className="cel-no hud">Admin approved</span>
              <Script text="Faculty" className="s-lg s-cyan" seed={43} />
              <ul style={{ '--c': '#27e1f2' }}>
                <li>Post the projects you want to supervise</li>
                <li>Browse student profiles and invite them</li>
                <li>Listed for students once approved</li>
              </ul>
              <Button to={`${ROUTES.REGISTER}?role=professor`} arrow>
                Request faculty listing
              </Button>
            </Reveal>
            <Reveal className="cel role" d={240}>
              <span className="cel-tl hud">Seat 03</span>
              <span className="cel-no hud">Moderation</span>
              <Script text="Admins" className="s-lg s-pink" seed={44} />
              <ul style={{ '--c': '#ff4a83' }}>
                <li>Review every faculty registration</li>
                <li>Approve or reject with an audit trail</li>
                <li>Keep the directory trustworthy</li>
              </ul>
              <Button to={ROUTES.LOGIN} arrow>
                Admin sign in
              </Button>
            </Reveal>
          </div>
        </section>

        <section className="wrap finale">
          <Script text="ready when you are" className="s-lg s-peach" seed={51} />
          <Reveal>
            <Paint as="h2" size="t-hero">
              {'Team up\nat GIKI.'}
            </Paint>
          </Reveal>
          <div className="hero-cta">
            <Button to={user ? ROUTES.DASHBOARD : ROUTES.REGISTER} variant="hot" size="lg" arrow>
              {user ? 'Open your dashboard' : 'Get started — it’s free'}
            </Button>
          </div>
          <Mascot wink />
        </section>
      </main>

      <footer className="foot">
        <div className="wrap foot-big">
          <div>
            <Brand sub="Ghulam Ishaq Khan Institute" />
            <p className="muted" style={{ marginTop: 16, maxWidth: '36ch', fontSize: 15 }}>
              Built for GIKI students and faculty to form strong Final Year Project teams.
            </p>
          </div>
          <div>
            <h4>Campus</h4>
            <ul>
              <li>Ghulam Ishaq Khan Institute</li>
              <li>Topi, Swabi</li>
              <li>Khyber Pakhtunkhwa, Pakistan</li>
            </ul>
          </div>
          <div>
            <h4>Get in touch</h4>
            <ul>
              <li>
                <a href="mailto:partnerlink@giki.edu.pk">partnerlink@giki.edu.pk</a>
              </li>
              <li>
                <Link to={ROUTES.LOGIN}>Sign in</Link>
              </li>
              <li>
                <Link to={ROUTES.REGISTER}>Create an account</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="wrap foot-in" style={{ borderTop: '1px solid var(--line)' }}>
          <span className="hud">Sc. 99 — End credits</span>
          <span className="hud">© {new Date().getFullYear()} PartnerLink · GIKI</span>
        </div>
      </footer>
    </div>
  );
}
