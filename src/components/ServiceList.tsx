import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { StudioService } from '../data/studioData';
import { useStaggeredEntrance } from '../hooks/useStaggeredEntrance';
import { StarMark } from './LyreLogo';

interface ServiceListProps {
  services: StudioService[];
  onSelectService: (slug: string) => void;
  onInquireService: (inquiryLabel: string) => void;
}

export function ServiceList({ services, onSelectService, onInquireService }: ServiceListProps) {
  const [activeSlug, setActiveSlug] = useState<string>(services[0]?.slug ?? '');
  const { containerRef, shouldReduceMotion, getItemProps } = useStaggeredEntrance<HTMLDivElement>({
    staggerDelay: 0.085,
    baseDelay: 0.04,
    distance: 16,
  });
  const activeService = services.find((s) => s.slug === activeSlug) ?? services[0];

  return (
    <div ref={containerRef} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
      {/* Left — Scannable Client-POV Discipline Index */}
      <div className="lg:col-span-7 divide-y divide-ink/15 border-t border-b border-ink/15">
        {services.map((service, index) => {
          const isActive = service.slug === activeService?.slug;

          return (
            <motion.div
              key={service.slug}
              {...getItemProps(index)}
              data-stagger-item="service"
              className={`group relative transition-colors duration-200 ${
                isActive ? 'bg-ink/[0.05]' : 'hover:bg-ink/[0.025]'
              }`}
            >
              <div className="flex items-start justify-between gap-4 py-5 sm:py-6 px-3 sm:px-4">
                <button
                  type="button"
                  onClick={() => setActiveSlug(service.slug)}
                  onMouseEnter={() => setActiveSlug(service.slug)}
                  onFocus={() => setActiveSlug(service.slug)}
                  aria-pressed={isActive}
                  className="flex-1 text-left cursor-pointer focus-visible:outline-none"
                >
                  <div className="flex items-center gap-3 mb-1.5">
                    <span
                      className={`font-sans text-xs tracking-[0.22em] tabular-nums font-medium transition-colors ${
                        isActive ? 'text-accent' : 'text-ink/55 group-hover:text-accent'
                      }`}
                    >
                      {service.number}
                    </span>
                    <span
                      aria-hidden="true"
                      className={`h-px transition-all duration-300 ${
                        isActive
                          ? 'w-10 bg-accent'
                          : 'w-5 bg-ink/20 group-hover:w-8 group-hover:bg-accent/60'
                      }`}
                    />
                    {isActive ? (
                      <StarMark className="w-3 h-3 text-accent shrink-0" />
                    ) : null}
                  </div>

                  <h3
                    className={`font-serif text-xl sm:text-2xl lg:text-[1.65rem] tracking-[0.01em] transition-colors ${
                      isActive ? 'text-ink' : 'text-ink/80 group-hover:text-ink'
                    }`}
                  >
                    {service.title}
                  </h3>

                  <p className="mt-1.5 font-sans text-sm leading-relaxed text-ink/70 max-w-xl">
                    {service.shortDescription}
                  </p>
                </button>

                <a
                  href={`/services#${service.slug}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectService(service.slug);
                  }}
                  aria-label={`Open ${service.title} details`}
                  className={`editorial-btn-hover mt-1 shrink-0 p-2 font-sans text-base ${
                    isActive
                      ? 'text-accent translate-x-0.5 -translate-y-0.5'
                      : 'text-ink/45 hover:text-accent'
                  }`}
                >
                  <span aria-hidden="true">↗</span>
                </a>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Right — Dynamic Contrast Obsidian Client Dossier */}
      {activeService ? (
        <motion.aside
          {...getItemProps(2)}
          data-stagger-item="service-dossier"
          aria-live="polite"
          aria-label="Selected discipline dossier"
          className="lg:col-span-5 lg:sticky lg:top-24 bg-contrast text-ink-contrast border border-ink/15 p-7 sm:p-9 overflow-hidden"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeService.slug}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between border-b border-ink-contrast/15 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="inline-block w-2 h-2 bg-signal shrink-0" aria-hidden="true" />
                  <span className="font-sans text-[11px] uppercase tracking-[0.24em] text-ink-contrast/75 tabular-nums">
                    Discipline {activeService.number}
                  </span>
                </div>
                <StarMark className="w-3.5 h-3.5 text-accent shrink-0" />
              </div>

              <div className="space-y-2.5">
                <h3 className="font-serif text-2xl sm:text-[1.75rem] leading-tight tracking-[0.01em] text-ink-contrast">
                  {activeService.title}
                </h3>
                <p className="font-serif italic text-lg leading-snug text-accent">
                  “{activeService.coreQuestion}”
                </p>
              </div>

              <div className="space-y-1.5">
                <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-ink-contrast/55">
                  Built For You
                </p>
                <p className="font-sans text-sm leading-relaxed text-ink-contrast/85">
                  {activeService.userNeed}
                </p>
              </div>

              <div className="pt-4 border-t border-ink-contrast/15 space-y-2.5">
                <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-ink-contrast/55">
                  What You Leave With
                </p>
                <ul className="space-y-1.5">
                  {activeService.deliverables.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 font-sans text-xs sm:text-[13px] text-ink-contrast/85"
                    >
                      <span className="text-accent mt-0.5 shrink-0" aria-hidden="true">
                        —
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-5 border-t border-ink-contrast/15 flex flex-wrap items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => onInquireService(activeService.inquiryLabel)}
                  className="editorial-btn-hover inline-flex items-center gap-2 bg-parchment text-obsidian px-4 py-2.5 text-[11px] font-sans font-medium uppercase tracking-[0.18em] whitespace-nowrap hover:bg-accent hover:text-parchment cursor-pointer"
                >
                  <span>Discuss {activeService.inquiryLabel}</span>
                  <span aria-hidden="true">↗</span>
                </button>

                <a
                  href={`/services#${activeService.slug}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectService(activeService.slug);
                  }}
                  className="editorial-link font-sans text-[11px] uppercase tracking-[0.18em] text-ink-contrast/75 hover:text-ink-contrast py-1 transition-colors"
                >
                  <span>Full Scope</span>
                  <span aria-hidden="true">↗</span>
                </a>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.aside>
      ) : null}
    </div>
  );
}
