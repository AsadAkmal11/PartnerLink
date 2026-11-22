import { useNavigate } from 'react-router-dom';
import PartnerLinkLanding from '../landing/PartnerLinkLanding.tsx';
import { useAuth } from '../context/AuthContext.jsx';
import { ROUTES } from '../routes/paths.js';

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // The landing renders plain anchors; send in-app paths through the router.
  function onClick(e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest?.('a[href]');
    const href = a?.getAttribute('href');
    if (!href || !href.startsWith('/')) return;
    e.preventDefault();
    navigate(href);
  }

  return (
    <div onClick={onClick}>
      <PartnerLinkLanding
        fontHref={null}
        ctaHref={user ? ROUTES.DASHBOARD : ROUTES.REGISTER}
        ctaLabel={user ? 'Open app' : 'Get started'}
        signInHref={user ? ROUTES.DASHBOARD : ROUTES.LOGIN}
        signInLabel={user ? 'Dashboard' : 'Sign in'}
      />
    </div>
  );
}
