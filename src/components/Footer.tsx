import React from 'react';
import { ArrowUpRight, Instagram, Mail, type LucideIcon } from 'lucide-react';
import { RouteId } from '../lib/router';
import { STUDIO_CONFIG } from '../data/studioData';
import { LyreWordmark } from './LyreLogo';

interface FooterProps {
  activeRoute: RouteId;
  onNavigate: (path: string) => void;
}

interface FooterConnectItem {
  id: string;
  label: string;
  handle: string;
  href: string;
  icon: LucideIcon;
  external?: boolean;
  routeId?: RouteId;
}

const FOOTER_LINKS: { id: RouteId; label: string; path: string }[] = [
  { id: 'home', label: 'Home', path: '/' },
  { id: 'services', label: 'Services', path: '/services' },
  { id: 'about', label: 'About', path: '/about' },
  { id: 'studio', label: 'Studio 3D', path: '/studio' },
  { id: 'contact', label: 'Contact', path: '/contact' },
];

const FOOTER_CONNECT_LINKS: FooterConnectItem[] = [
  {
    id: 'instagram',
    label: 'Instagram',
    handle: STUDIO_CONFIG.instagram,
    href: STUDIO_CONFIG.instagramUrl,
    icon: Instagram,
    external: true,
  },
  {
    id: 'contact',
    label: 'Direct Brief',
    handle: 'Contact Us',
    href: '/contact',
    icon: Mail,
    routeId: 'contact',
  },
];

export function Footer({ activeRoute, onNavigate }: FooterProps) {
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    onNavigate(path);
  };

  const year = new Date().getFullYear();

  return (
    <footer className="bg-contrast text-ink-contrast border-t border-ink/15">
      <div className="max-w-[1380px] mx-auto px-5 sm:px-8 lg:px-12 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-14 border-b border-ink-contrast/15">
          <div className="md:col-span-5 space-y-6">
            <a
              href="/"
              onClick={(e) => handleLinkClick(e, '/')}
              className="editorial-btn-hover inline-block"
              aria-label="Orpheus Studios Home"
            >
              <LyreWordmark variant="dark" stacked />
            </a>
            <p className="font-serif text-xl sm:text-2xl leading-snug text-ink-contrast/90 max-w-sm">
              {STUDIO_CONFIG.tagline}
            </p>
            <p className="font-sans text-sm text-ink-contrast/60 max-w-sm leading-relaxed">
              Independent creative studio across filmmaking, brand strategy, creative direction,
              identity and digital design.
            </p>
          </div>

          <div className="md:col-span-3">
            <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-ink-contrast/50 mb-5">
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
                        isActive ? 'text-accent' : 'text-ink-contrast/80 hover:text-ink-contrast'
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
              <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-ink-contrast/50 mb-2">
                Studio Location
              </p>
              <p className="font-sans text-sm text-ink-contrast/85">{STUDIO_CONFIG.location}</p>
              <p className="font-sans text-xs text-ink-contrast/55 mt-1">
                {STUDIO_CONFIG.availability}
              </p>
            </div>

            <div>
              <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-ink-contrast/50 mb-2">
                Email
              </p>
              <a
                href={`mailto:${STUDIO_CONFIG.email}`}
                className="editorial-link font-sans text-sm text-ink-contrast/85 hover:text-accent transition-colors"
              >
                {STUDIO_CONFIG.email}
              </a>
            </div>

            <div>
              <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-ink-contrast/50 mb-3">
                Social &amp; Contact
              </p>
              <div
                data-testid="footer-social-grid"
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2 gap-3"
              >
                {FOOTER_CONNECT_LINKS.map((item) => {
                  const Icon = item.icon;
                  const isCurrentContact = Boolean(item.routeId && activeRoute === item.routeId);

                  return (
                    <a
                      key={item.id}
                      href={item.href}
                      target={item.external ? '_blank' : undefined}
                      rel={item.external ? 'noopener noreferrer' : undefined}
                      onClick={
                        item.external ? undefined : (e) => handleLinkClick(e, item.href)
                      }
                      aria-label={`${item.label}: ${item.handle}`}
                      className={`editorial-btn-hover group flex items-center justify-between gap-3 px-4 py-3 border transition-colors ${
                        isCurrentContact
                          ? 'border-accent bg-accent/10 text-ink-contrast'
                          : 'border-ink-contrast/20 bg-ink-contrast/[0.03] text-ink-contrast/85 hover:border-accent hover:text-ink-contrast'
                      }`}
                    >
                      <span className="flex items-center gap-3 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isCurrentContact
                              ? 'text-accent'
                              : 'text-ink-contrast/65 group-hover:text-accent'
                          }`}
                          aria-hidden="true"
                        />
                        <span className="min-w-0">
                          <span className="block font-sans text-[10px] uppercase tracking-[0.18em] text-ink-contrast/50">
                            {item.label}
                          </span>
                          <span className="block font-sans text-xs font-medium truncate">
                            {item.handle}
                          </span>
                        </span>
                      </span>
                      <ArrowUpRight
                        className="w-3.5 h-3.5 shrink-0 text-ink-contrast/45 group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200"
                        aria-hidden="true"
                      />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-sans text-ink-contrast/50">
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
