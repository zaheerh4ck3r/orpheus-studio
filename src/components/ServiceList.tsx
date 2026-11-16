import React, { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { StudioService } from '../data/studioData';
import { StarMark } from './LyreLogo';

interface ServiceListProps {
  services: StudioService[];
  onSelectService: (slug: string) => void;
  onInquireService: (inquiryLabel: string) => void;
}

export function ServiceList({ services, onSelectService, onInquireService }: ServiceListProps) {
  const [activeSlug, setActiveSlug] = useState<string>(services[0]?.slug ?? '');
  const shouldReduceMotion = useReducedMotion();
  const activeService = services.find((s) => s.slug === activeSlug) ?? services[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
      {/* Left — Scannable Client-POV Discipline Index */}
      <div className="lg:col-span-7 divide-y divide-obsidian/15 border-t border-b border-obsidian/15">
        {services.map((service) => {
          const isActive = service.slug === activeService?.slug;

          return (
            <div
              key={service.slug}
              className={`group relative transition-colors duration-200 ${
                isActive ? 'bg-obsidian/[0.04]' : 'hover:bg-obsidian/[0.02]'
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
                        isActive ? 'text-vermilion' : 'text-obsidian/55 group-hover:text-vermilion'
                      }`}
                    >
                      {service.number}
                    </span>
                    <span
                      aria-hidden="true"
                      className={`h-px transition-all duration-300 ${
                        isActive
                          ? 'w-10 bg-vermilion'
                          : 'w-5 bg-obsidian/20 group-hover:w-8 group-hover:bg-vermilion/60'
                      }`}
                    />
                    {isActive ? (
                      <StarMark className="w-3 h-3 text-vermilion shrink-0" />
                    ) : null}
                  </div>

                  <h3
                    className={`font-serif text-xl sm:text-2xl lg:text-[1.65rem] tracking-[0.01em] transition-colors ${
                      isActive ? 'text-obsidian' : 'text-obsidian/80 group-hover:text-obsidian'
                    }`}
                  >
                    {service.title}
                  </h3>

                  <p className="mt-1.5 font-sans text-sm leading-relaxed text-obsidian/70 max-w-xl">
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
                  className={`mt-1 shrink-0 p-2 font-sans text-base transition-all duration-200 ${
                    isActive
                      ? 'text-vermilion translate-x-0.5 -translate-y-0.5'
                      : 'text-obsidian/45 hover:text-vermilion hover:translate-x-0.5 hover:-translate-y-0.5'
                  }`}
                >
                  <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Right — Dynamic Obsidian Client Dossier */}
      {activeService ? (
        <aside
          aria-live="polite"
          aria-label="Selected discipline dossier"
          className="lg:col-span-5 lg:sticky lg:top-24 bg-obsidian text-parchment border border-obsidian p-7 sm:p-9 overflow-hidden"
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
              <div className="flex items-center justify-between border-b border-parchment/15 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="inline-block w-2 h-2 bg-cobalt shrink-0" aria-hidden="true" />
                  <span className="font-sans text-[11px] uppercase tracking-[0.24em] text-parchment/75 tabular-nums">
                    Discipline {activeService.number}
                  </span>
                </div>
                <StarMark className="w-3.5 h-3.5 text-vermilion shrink-0" />
              </div>

              <div className="space-y-2.5">
                <h3 className="font-serif text-2xl sm:text-[1.75rem] leading-tight tracking-[0.01em] text-parchment">
                  {activeService.title}
                </h3>
                <p className="font-serif italic text-lg leading-snug text-vermilion">
                  “{activeService.coreQuestion}”
                </p>
              </div>

              <div className="space-y-1.5">
                <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-parchment/55">
                  Built For You
                </p>
                <p className="font-sans text-sm leading-relaxed text-parchment/85">
                  {activeService.userNeed}
                </p>
              </div>

              <div className="pt-4 border-t border-parchment/15 space-y-2.5">
                <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-parchment/55">
                  What You Leave With
                </p>
                <ul className="space-y-1.5">
                  {activeService.deliverables.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 font-sans text-xs sm:text-[13px] text-parchment/85"
                    >
                      <span className="text-vermilion mt-0.5 shrink-0" aria-hidden="true">
                        —
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-5 border-t border-parchment/15 flex flex-wrap items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => onInquireService(activeService.inquiryLabel)}
                  className="inline-flex items-center gap-2 bg-parchment text-obsidian px-4 py-2.5 text-[11px] font-sans font-medium uppercase tracking-[0.18em] whitespace-nowrap hover:bg-vermilion hover:text-parchment transition-colors duration-200 cursor-pointer"
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
                  className="editorial-link font-sans text-[11px] uppercase tracking-[0.18em] text-parchment/75 hover:text-parchment py-1 transition-colors"
                >
                  <span>Full Scope</span>
                  <span aria-hidden="true">↗</span>
                </a>
              </div>
            </motion.div>
          </AnimatePresence>
        </aside>
      ) : null}
    </div>
  );
}
