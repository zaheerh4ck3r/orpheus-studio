import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../lib/theme';

interface ThemeSwitcherProps {
  compact?: boolean;
  contrastSurface?: boolean;
  displayClass?: string;
}

/**
 * Editorial Parchment / Obsidian theme toggle matching studio typography and sharp geometry.
 */
export function ThemeSwitcher({
  compact = false,
  contrastSurface = false,
  displayClass = 'inline-flex',
}: ThemeSwitcherProps) {
  const { theme, isDark, toggleTheme } = useTheme();
  const nextLabel = isDark ? 'Switch to Parchment light mode' : 'Switch to Obsidian dark mode';

  if (compact) {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={nextLabel}
        aria-pressed={isDark}
        data-theme-value={theme}
        data-testid="theme-switcher-mobile"
        className={`${displayClass} editorial-btn-hover items-center justify-center w-11 h-11 border cursor-pointer shrink-0 ${
          contrastSurface
            ? 'border-ink-contrast/25 text-ink-contrast hover:border-accent hover:text-accent'
            : 'border-ink/20 text-ink hover:border-ink'
        }`}
      >
        {isDark ? (
          <Sun className="w-4 h-4 text-accent" aria-hidden="true" />
        ) : (
          <Moon className="w-4 h-4" aria-hidden="true" />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={nextLabel}
      aria-pressed={isDark}
      data-theme-value={theme}
      data-testid="theme-switcher"
      className={`${displayClass} editorial-btn-hover items-center gap-2 px-3 py-2 text-[11px] font-sans font-medium uppercase tracking-[0.14em] border whitespace-nowrap shrink-0 cursor-pointer ${
        contrastSurface
          ? 'border-ink-contrast/25 text-ink-contrast/85 hover:border-accent hover:text-ink-contrast'
          : 'border-ink/20 text-ink/80 hover:border-ink hover:text-ink'
      }`}
    >
      <span
        aria-hidden="true"
        className={`inline-flex w-3 h-3 border ${
          contrastSurface ? 'border-ink-contrast/50' : 'border-ink/50'
        } overflow-hidden shrink-0`}
      >
        <span className="w-1/2 h-full bg-parchment" />
        <span className="w-1/2 h-full bg-obsidian" />
      </span>
      <span>{isDark ? 'Obsidian' : 'Parchment'}</span>
    </button>
  );
}
