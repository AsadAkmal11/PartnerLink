import { createContext, useContext } from 'react';

export const THEMES = { DARK: 'dark' };
export const THEME_STORAGE_KEY = 'partnerlink-theme';

export const ThemeContext = createContext({
  theme: THEMES.DARK,
  isDark: true,
  setTheme: () => {},
  toggleTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}
