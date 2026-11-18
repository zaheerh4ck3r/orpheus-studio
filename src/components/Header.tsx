import React from 'react';
import { Menu, MessageSquare } from 'lucide-react';
import { RouteId } from '../lib/router';
import { LyreWordmark } from './LyreLogo';
import { ThemeSwitcher } from './ThemeSwitcher';

interface HeaderProps {
  activeRoute: RouteId;
  onNavigate: (path: string) => void;
  onOpenMobileMenu: () => void;
  onOpenConcierge: () => void;
  mobileMenuOpen: boolean;
}

const NAV_ITEMS: { id: RouteId; label: string; path: string }[] = [
  { id: 'home', label: 'Home', path: '/' },
  { id: 'services', label: 'Services', path: '/services' },
  { id: 'about', label: 'About', path: '/about' },
  { id: 'studio', label: 'Studio 3D', path: '/studio' },
];

export function Header({
  activeRoute,
  onNavigate,
  onOpenMobileMenu,
  onOpenConcierge,
  mobileMenuOpen,
}: HeaderProps) {
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    onNavigate(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-canvas/95 backdrop-blur-sm border-b border-ink/15 transition-colors duration-200">
      <div className="max-w-[1380px] mx-auto px-5 sm:px-8 lg:px-12 h-[72px] flex items-center justify-between gap-4 sm:gap-6">
        <a
          href="/"
          onClick={(e) => handleLinkClick(e, '/')}
          className="editorial-btn-hover shrink-0 whitespace-nowrap focus-visible:outline-none"
          aria-label="Orpheus Studios Home"
        >
          <LyreWordmark variant="light" stacked />
        </a>

        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7 lg:gap-8 text-[13px] font-sans font-medium tracking-[0.06em] uppercase text-ink/80"
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
                  isActive ? 'text-ink' : 'text-ink/70 hover:text-ink'
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <ThemeSwitcher displayClass="hidden sm:inline-flex" />
          <ThemeSwitcher compact displayClass="inline-flex sm:hidden" />

          <button
            type="button"
            onClick={onOpenConcierge}
            data-testid="header-concierge-button"
            aria-label="Open Studio Concierge chat"
            className="editorial-btn-hover hidden lg:inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-sans font-medium uppercase tracking-[0.14em] whitespace-nowrap shrink-0 border border-ink/25 text-ink hover:border-ink cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
            <span>Concierge</span>
          </button>

          <a
            href="/contact"
            onClick={(e) => handleLinkClick(e, '/contact')}
            className={`editorial-btn-hover hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-sans font-medium uppercase tracking-[0.14em] whitespace-nowrap shrink-0 border ${
              activeRoute === 'contact'
                ? 'bg-accent text-parchment border-accent'
                : 'bg-btn text-btn-ink border-btn hover:bg-accent hover:text-parchment hover:border-accent'
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
            className="editorial-btn-hover md:hidden inline-flex items-center justify-center w-11 h-11 text-ink border border-ink/20 hover:border-ink cursor-pointer"
          >
            <Menu className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}
