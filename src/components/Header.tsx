import React from 'react';
import { Menu } from 'lucide-react';
import { motion, useReducedMotion, useScroll, useSpring } from 'motion/react';
import { RouteId } from '../lib/router';
import { LyreWordmark } from './LyreLogo';

interface HeaderProps {
  activeRoute: RouteId;
  onNavigate: (path: string) => void;
  onOpenMobileMenu: () => void;
  mobileMenuOpen: boolean;
}

const NAV_ITEMS: { id: RouteId; label: string; path: string }[] = [
  { id: 'home', label: 'Home', path: '/' },
  { id: 'services', label: 'Services', path: '/services' },
  { id: 'about', label: 'About', path: '/about' },
];

export function Header({
  activeRoute,
  onNavigate,
  onOpenMobileMenu,
  mobileMenuOpen,
}: HeaderProps) {
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 32,
    restDelta: 0.001,
  });

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    onNavigate(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-parchment/95 backdrop-blur-sm border-b border-obsidian/15">
      <div className="max-w-[1380px] mx-auto px-5 sm:px-8 lg:px-12 h-[72px] flex items-center justify-between gap-8">
        <a
          href="/"
          onClick={(e) => handleLinkClick(e, '/')}
          className="shrink-0 whitespace-nowrap focus-visible:outline-none"
          aria-label="Orpheus Studios Home"
        >
          <LyreWordmark variant="light" stacked />
        </a>

        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-8 text-[13px] font-sans font-medium tracking-[0.06em] uppercase text-obsidian/80"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeRoute === item.id;
            return (
              <a
                key={item.id}
                href={item.path}
                onClick={(e) => handleLinkClick(e, item.path)}
                data-active={isActive ? 'true' : 'false'}
                className={`editorial-link py-1 whitespace-nowrap shrink-0 transition-colors duration-200 ${
                  isActive ? 'text-obsidian' : 'text-obsidian/70 hover:text-obsidian'
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href="/contact"
            onClick={(e) => handleLinkClick(e, '/contact')}
            className={`hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-sans font-medium uppercase tracking-[0.14em] whitespace-nowrap shrink-0 border transition-colors duration-200 ${
              activeRoute === 'contact'
                ? 'bg-vermilion text-parchment border-vermilion'
                : 'bg-obsidian text-parchment border-obsidian hover:bg-vermilion hover:border-vermilion'
            }`}
          >
            <span>Let&apos;s Talk</span>
            <span aria-hidden="true">↗</span>
          </a>

          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="Open navigation menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-drawer"
            className="md:hidden inline-flex items-center justify-center w-11 h-11 text-obsidian border border-obsidian/20 hover:border-obsidian transition-colors"
          >
            <Menu className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {!shouldReduceMotion ? (
        <motion.div
          aria-hidden="true"
          style={{ scaleX }}
          className="h-[2px] w-full bg-vermilion origin-left pointer-events-none"
        />
      ) : null}
    </header>
  );
}
