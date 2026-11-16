import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { RouteId } from '../lib/router';
import { STUDIO_CONFIG } from '../data/studioData';
import { LyreWordmark } from './LyreLogo';

interface MobileNavigationProps {
  isOpen: boolean;
  activeRoute: RouteId;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

const MOBILE_LINKS: { id: RouteId; index: string; label: string; path: string }[] = [
  { id: 'home', index: '01', label: 'Home', path: '/' },
  { id: 'services', index: '02', label: 'Services', path: '/services' },
  { id: 'about', index: '03', label: 'About', path: '/about' },
  { id: 'contact', index: '04', label: 'Contact', path: '/contact' },
];

export function MobileNavigation({
  isOpen,
  activeRoute,
  onClose,
  onNavigate,
}: MobileNavigationProps) {
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    onClose();
    onNavigate(path);
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          id="mobile-navigation-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-50 bg-obsidian text-parchment flex flex-col justify-between px-6 py-5"
        >
          <div className="flex items-center justify-between border-b border-parchment/15 pb-5">
            <a
              href="/"
              onClick={(e) => handleLinkClick(e, '/')}
              aria-label="Orpheus Studios Home"
            >
              <LyreWordmark variant="dark" stacked />
            </a>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close navigation menu"
              className="inline-flex items-center justify-center w-11 h-11 border border-parchment/25 text-parchment hover:border-vermilion hover:text-vermilion transition-colors"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          <nav aria-label="Mobile navigation" className="my-auto py-8">
            <ul className="divide-y divide-parchment/12">
              {MOBILE_LINKS.map((item) => {
                const isActive = activeRoute === item.id;
                return (
                  <li key={item.id}>
                    <a
                      href={item.path}
                      onClick={(e) => handleLinkClick(e, item.path)}
                      className="flex items-baseline justify-between py-5 group"
                    >
                      <span className="flex items-baseline gap-4">
                        <span className="text-xs font-sans tracking-[0.2em] text-vermilion tabular-nums">
                          {item.index}
                        </span>
                        <span
                          className={`font-serif text-3xl tracking-[-0.01em] transition-colors ${
                            isActive
                              ? 'text-vermilion italic'
                              : 'text-parchment group-hover:text-vermilion'
                          }`}
                        >
                          {item.label}
                        </span>
                      </span>
                      <span
                        aria-hidden="true"
                        className="text-parchment/50 group-hover:text-parchment transition-transform duration-200 group-hover:translate-x-1"
                      >
                        ↗
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="pt-5 border-t border-parchment/15 text-xs font-sans text-parchment/65 space-y-1.5">
            <p className="uppercase tracking-[0.16em] text-parchment/85">
              {STUDIO_CONFIG.location}
            </p>
            <p>
              {STUDIO_CONFIG.email} · {STUDIO_CONFIG.instagram}
            </p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
