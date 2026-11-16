import React from 'react';
import { RouteId } from '../lib/router';
import { STUDIO_CONFIG } from '../data/studioData';
import { LyreWordmark } from './LyreLogo';

interface FooterProps {
  activeRoute: RouteId;
  onNavigate: (path: string) => void;
}

const FOOTER_LINKS: { id: RouteId; label: string; path: string }[] = [
  { id: 'home', label: 'Home', path: '/' },
  { id: 'services', label: 'Services', path: '/services' },
  { id: 'about', label: 'About', path: '/about' },
  { id: 'contact', label: 'Contact', path: '/contact' },
];

export function Footer({ activeRoute, onNavigate }: FooterProps) {
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    onNavigate(path);
  };

  const year = new Date().getFullYear();

  return (
    <footer className="bg-obsidian text-parchment border-t border-parchment/12">
      <div className="max-w-[1380px] mx-auto px-5 sm:px-8 lg:px-12 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-14 border-b border-parchment/15">
          <div className="md:col-span-5 space-y-6">
            <a
              href="/"
              onClick={(e) => handleLinkClick(e, '/')}
              className="inline-block"
              aria-label="Orpheus Studios Home"
            >
              <LyreWordmark variant="dark" stacked />
            </a>
            <p className="font-serif text-xl sm:text-2xl leading-snug text-parchment/90 max-w-sm">
              {STUDIO_CONFIG.tagline}
            </p>
            <p className="font-sans text-sm text-parchment/60 max-w-sm leading-relaxed">
              Independent creative studio across filmmaking, brand strategy, creative direction,
              identity and digital design.
            </p>
          </div>

          <div className="md:col-span-3">
            <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-parchment/50 mb-5">
              Navigation
            </p>
            <ul className="space-y-3">
              {FOOTER_LINKS.map((link) => {
                const isActive = activeRoute === link.id;
                return (
                  <li key={link.id}>
                    <a
                      href={link.path}
                      onClick={(e) => handleLinkClick(e, link.path)}
                      className={`editorial-link font-sans text-sm transition-colors ${
                        isActive ? 'text-vermilion' : 'text-parchment/80 hover:text-parchment'
                      }`}
                    >
                      {link.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="md:col-span-4 space-y-6">
            <div>
              <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-parchment/50 mb-2">
                Studio Location
              </p>
              <p className="font-sans text-sm text-parchment/85">{STUDIO_CONFIG.location}</p>
              <p className="font-sans text-xs text-parchment/55 mt-1">
                {STUDIO_CONFIG.availability}
              </p>
            </div>

            <div>
              <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-parchment/50 mb-2">
                Email
              </p>
              <a
                href={`mailto:${STUDIO_CONFIG.email}`}
                className="editorial-link font-sans text-sm text-parchment/85 hover:text-vermilion transition-colors"
              >
                {STUDIO_CONFIG.email}
              </a>
            </div>

            <div>
              <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-parchment/50 mb-2">
                Instagram
              </p>
              <a
                href={STUDIO_CONFIG.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="editorial-link font-sans text-sm text-parchment/85 hover:text-vermilion transition-colors"
              >
                <span>{STUDIO_CONFIG.instagram}</span>
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-sans text-parchment/50">
          <p className="tabular-nums">
            &copy; {year} {STUDIO_CONFIG.name}. All rights reserved.
          </p>
          <p className="tracking-[0.14em] uppercase">
            Film · Strategy · Direction · Identity
          </p>
        </div>
      </div>
    </footer>
  );
}
