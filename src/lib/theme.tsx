import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'parchment' | 'obsidian';

export const THEME_STORAGE_KEY = 'orpheus-theme';

export function parseStoredTheme(rawValue: string | null | undefined): ThemeMode {
  return rawValue === 'obsidian' ? 'obsidian' : 'parchment';
}

export function getNextTheme(current: ThemeMode): ThemeMode {
  return current === 'parchment' ? 'obsidian' : 'parchment';
}

export function applyThemeToDocument(theme: ThemeMode): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  root.style.colorScheme = theme === 'obsidian' ? 'dark' : 'light';
}

interface ThemeContextValue {
  theme: ThemeMode;
  isDark: boolean;
  setTheme: (next: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'parchment';
    try {
      return parseStoredTheme(window.localStorage.getItem(THEME_STORAGE_KEY));
    } catch {
      return 'parchment';
    }
  });

  useEffect(() => {
    applyThemeToDocument(theme);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore storage failures in restricted browsing contexts.
    }
  }, [theme]);

  const setTheme = useCallback((next: ThemeMode) => {
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => getNextTheme(prev));
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: theme === 'obsidian',
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used inside a ThemeProvider.');
  }
  return ctx;
}
