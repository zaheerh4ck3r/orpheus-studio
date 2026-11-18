import React, { useEffect, useRef } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { RouteId } from '../lib/router';
import { STUDIO_CONFIG } from '../data/studioData';
import { LyreWordmark } from './LyreLogo';
import { ThemeSwitcher } from './ThemeSwitcher';

interface MobileNavigationProps {
  isOpen: boolean;
  activeRoute: RouteId;
  onClose: () => void;
  onNavigate: (path: string) => void;
  onOpenConcierge: () => void;
}

const MOBILE_LINKS: { id: RouteId; index: string; label: string; path: string }[] = [
  { id: 'home', index: '01', label: 'Home', path: '/' },
  { id: 'services', index: '02', label: 'Services', path: '/services' },
  { id: 'about', index: '03', label: 'About', path: '/about' },
  { id: 'studio', index: '04', label: 'Studio 3D', path: '/studio' },
  { id: 'contact', index: '05', label: 'Contact', path: '/contact' },
];

const EDITORIAL_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function MobileNavigation({
  isOpen,
  activeRoute,
  onClose,
  onNavigate,
  onOpenConcierge,
}: MobileNavigationProps) {
  const shouldReduceMotion = useReducedMotion();
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    const rafId = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    return () => {
      window.cancelAnimationFrame(rafId);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus();
      }
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
        <div
          id="mobile-navigation-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          className="fixed inset-0 z-50 flex justify-end overflow-hidden"
        >
          {/* Hardware-accelerated opacity scrim */}
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0.1 : 0.24, ease: EDITORIAL_EASE }}
            onClick={onClose}
            style={{ willChange: 'opacity' }}
            className="fixed inset-0 bg-obsidian/60"
          />

          {/* Hardware-accelerated slide-over drawer panel */}
          <motion.aside
            data-testid="mobile-drawer-panel"
            initial={shouldReduceMotion ? { opacity: 0 } : { x: '100%' }}
            animate={shouldReduceMotion ? { opacity: 1 } : { x: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { x: '100%' }}
            transition={{
              duration: shouldReduceMotion ? 0.12 : 0.34,
              ease: EDITORIAL_EASE,
            }}
            transformTemplate={({ x }) =>
              x ? `translate3d(${x}, 0, 0)` : 'translate3d(0, 0, 0)'
            }
            style={{ willChange: 'transform' }}
            className="relative z-10 w-full sm:max-w-[420px] h-full bg-contrast text-ink-contrast border-l border-ink-contrast/15 shadow-2xl flex flex-col justify-between px-6 py-5 overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-ink-contrast/15 pb-5">
              <a
                href="/"
                onClick={(e) => handleLinkClick(e, '/')}
                aria-label="Orpheus Studios Home"
                className="editorial-btn-hover shrink-0"
              >
                <LyreWordmark variant="dark" stacked />
              </a>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                aria-label="Close navigation menu"
                className="editorial-btn-hover inline-flex items-center justify-center w-11 h-11 border border-ink-contrast/25 text-ink-contrast hover:border-accent hover:text-accent cursor-pointer"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <nav aria-label="Mobile navigation" className="my-auto py-6">
              <ul className="divide-y divide-ink-contrast/12">
                {MOBILE_LINKS.map((item, idx) => {
                  const isActive = activeRoute === item.id;
                  return (
                    <motion.li
                      key={item.id}
                      initial={shouldReduceMotion ? false : { opacity: 0, x: 18 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 10 }}
                      transition={{
                        duration: shouldReduceMotion ? 0 : 0.28,
                        delay: shouldReduceMotion ? 0 : 0.08 + idx * 0.045,
                        ease: EDITORIAL_EASE,
                      }}
                    >
                      <a
                        href={item.path}
                        onClick={(e) => handleLinkClick(e, item.path)}
                        className="flex items-baseline justify-between py-4 group"
                      >
                        <span className="flex items-baseline gap-4">
                          <span className="text-xs font-sans tracking-[0.2em] text-accent tabular-nums">
                            {item.index}
                          </span>
                          <span
                            className={`font-serif text-3xl tracking-[-0.01em] transition-colors ${
                              isActive
                                ? 'text-accent italic'
                                : 'text-ink-contrast group-hover:text-accent'
                            }`}
                          >
                            {item.label}
                          </span>
                        </span>
                        <span
                          aria-hidden="true"
                          className="text-ink-contrast/50 group-hover:text-ink-contrast transition-transform duration-200 group-hover:translate-x-1"
                        >
                          ↗
                        </span>
                      </a>
                    </motion.li>
                  );
                })}
              </ul>

              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0 }}
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.26,
                  delay: shouldReduceMotion ? 0 : 0.28,
                  ease: EDITORIAL_EASE,
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenConcierge();
                  }}
                  className="editorial-btn-hover mt-5 w-full inline-flex items-center justify-center gap-2 border border-ink-contrast/30 px-4 py-3.5 text-xs font-sans uppercase tracking-[0.18em] text-ink-contrast hover:border-accent hover:text-accent cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
                  <span>Ask Studio Concierge</span>
                </button>
              </motion.div>
            </nav>

            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0 }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.26,
                delay: shouldReduceMotion ? 0 : 0.32,
                ease: EDITORIAL_EASE,
              }}
              className="pt-5 border-t border-ink-contrast/15 text-xs font-sans text-ink-contrast/65 flex items-end justify-between gap-4"
            >
              <div className="space-y-1.5">
                <p className="uppercase tracking-[0.16em] text-ink-contrast/85">
                  {STUDIO_CONFIG.location}
                </p>
                <p>
                  {STUDIO_CONFIG.email} · {STUDIO_CONFIG.instagram}
                </p>
              </div>
              <ThemeSwitcher contrastSurface />
            </motion.div>
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
