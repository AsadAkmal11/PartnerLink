import { Button, Plates } from '../components/ui.jsx';
import { ROUTES } from '../routes/paths.js';

export default function NotFoundPage() {
  return (
    <section className="lost">
      <div>
        <p className="label rise">Error · page not on the sheet</p>
        <div className="rise" style={{ '--d': 80, marginTop: 20 }}>
          <Plates>404</Plates>
        </div>
        <p className="lead rise" style={{ '--d': 160, margin: '28px auto 0' }}>
          This page was never printed. Head back and find your team from the start.
        </p>
        <div className="row-act rise" style={{ '--d': 220, justifyContent: 'center', marginTop: 28 }}>
          <Button to={ROUTES.HOME} variant="solid" size="lg">
            Back to home
          </Button>
          <Button to={ROUTES.REGISTER} size="lg">
            Get started
          </Button>
        </div>
      </div>
    </section>
  );
}
