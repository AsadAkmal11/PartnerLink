import { Button, Mascot, Paint, Script } from '../components/ui.jsx';
import { ROUTES } from '../routes/paths.js';

export default function NotFoundPage() {
  return (
    <section className="notfound">
      <span className="hud rise">Sc. 404 — Cut from the reel</span>
      <Script text="oops, wrong scene" className="s-lg s-pink" seed={91} />
      <Paint size="t-hero" d={120}>
        404
      </Paint>
      <p className="lead rise" style={{ '--d': 300 }}>
        This frame never made it to the final cut. Head back and find your team from the start.
      </p>
      <div className="row-act rise" style={{ '--d': 400, justifyContent: 'center', marginTop: 8 }}>
        <Button to={ROUTES.HOME} variant="hot" size="lg" arrow>
          Back to home
        </Button>
        <Button to={ROUTES.REGISTER} size="lg">
          Get started
        </Button>
      </div>
      <Mascot wink d={600} />
    </section>
  );
}
