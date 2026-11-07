import { useEffect, useState } from 'react';

/**
 * useActiveSection — returns the id of the section currently crossing the
 * middle of the viewport. Pass a stable (module-level) array of ids.
 */
export function useActiveSection(ids, enabled = true) {
  const [active, setActive] = useState(ids[0] ?? null);

  useEffect(() => {
    if (!enabled || typeof IntersectionObserver === 'undefined') return undefined;

    const elements = ids.map((id) => document.getElementById(id)).filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids, enabled]);

  return enabled ? active : null;
}
