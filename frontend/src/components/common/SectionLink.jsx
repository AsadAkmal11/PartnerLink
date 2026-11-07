import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '../../routes/paths.js';

/**
 * SectionLink — links to a landing-page section by id.
 * On the landing page it is a native anchor (smooth scroll via CSS);
 * on any other route it navigates home and LandingPage scrolls to the hash.
 */
export default function SectionLink({ id, children, ...rest }) {
  const { pathname } = useLocation();

  if (pathname === ROUTES.HOME) {
    return (
      <a href={`#${id}`} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <Link to={{ pathname: ROUTES.HOME, hash: `#${id}` }} {...rest}>
      {children}
    </Link>
  );
}
