import { createContext, useContext } from 'react';

export const THEME_STORAGE_KEY = 'partnerlink-theme';
export const THEMES = { DARK: 'dark', LIGHT: 'light' };

export const ThemeContext = createContext(null);

/**
 * useTheme — read and change the active colour theme.
 * @returns {{ theme: 'dark' | 'light', isDark: boolean, setTheme: Function, toggleTheme: Function }}
 */
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
