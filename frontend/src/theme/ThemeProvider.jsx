import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ThemeContext, THEMES, THEME_STORAGE_KEY } from './ThemeContext.js';

const META_COLORS = { dark: '#0A0A0A', light: '#F8FAFC' };

/** The inline script in index.html has already applied the saved theme. */
function getInitialTheme() {
  if (typeof document === 'undefined') return THEMES.DARK;
  const attr = document.documentElement.getAttribute('data-theme');
  return attr === THEMES.LIGHT ? THEMES.LIGHT : THEMES.DARK;
}

export default function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitialTheme);
  const transitionTimer = useRef(null);

  // Sync the DOM, browser chrome colour and storage whenever the theme changes.
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.style.colorScheme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', META_COLORS[theme]);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      /* storage unavailable (private mode) — theme still works for this visit */
    }
  }, [theme]);

  useEffect(() => () => clearTimeout(transitionTimer.current), []);

  const setTheme = useCallback((next) => {
    // Enable colour transitions only for the moment of switching,
    // so normal hover/motion transitions are never affected.
    const root = document.documentElement;
    root.classList.add('theme-transition');
    clearTimeout(transitionTimer.current);
    transitionTimer.current = setTimeout(() => root.classList.remove('theme-transition'), 450);
    setThemeState(next === THEMES.LIGHT ? THEMES.LIGHT : THEMES.DARK);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK);
  }, [theme, setTheme]);

  const value = useMemo(
    () => ({ theme, isDark: theme === THEMES.DARK, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
