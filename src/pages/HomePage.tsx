import React, { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { STUDIO_CONFIG, APPROACH_STAGES, STUDIO_SERVICES } from '../data/studioData';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { useStaggeredEntrance } from '../hooks/useStaggeredEntrance';
import { ContactCTA } from '../components/ContactCTA';
import { Hero } from '../components/Hero';
import { LyreMark, StarMark } from '../components/LyreLogo';
import { SectionHeading } from '../components/SectionHeading';
import { ServiceList } from '../components/ServiceList';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  useDocumentMeta({ routeId: 'home' });
  const [activeStageIdx, setActiveStageIdx] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  const processEntrance = useStaggeredEntrance<HTMLDivElement>({
    staggerDelay: 0.09,
    baseDelay: 0.05,
    distance: 18,
  });

  const philosophyEntrance = useStaggeredEntrance<HTMLDivElement>({
    staggerDelay: 0.14,
    baseDelay: 0.04,
    distance: 18,
  });

  const scrollToServices = () => {
    const el = document.getElementById('what-we-do');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const activeStage = APPROACH_STAGES[activeStageIdx] ?? APPROACH_STAGES[0];
  const progressFraction = (activeStageIdx + 1) / APPROACH_STAGES.length;
  const ribbonDisciplines = [...STUDIO_SERVICES, ...STUDIO_SERVICES];

  return (
    <>
      {/* 1. Opening Statement + Studio Crest */}
      <Hero onDiscoverClick={scrollToServices} onNavigate={onNavigate} />

      {/* 2. Restrained Editorial Discipline Ribbon */}
      <div
        aria-hidden="true"
        className="editorial-marquee bg-canvas-elevated text-ink border-b border-ink/15 overflow-hidden select-none transition-colors duration-200"
      >
        <div className="editorial-marquee-track py-3.5 items-center">
          {ribbonDisciplines.map((service, index) => (
            <div key={`${service.slug}-${index}`} className="flex items-center shrink-0">
              <span className="font-sans text-[11px] uppercase tracking-[0.26em] text-ink/80 px-6 whitespace-nowrap">
                {service.number} · {service.title}
              </span>
              <StarMark className="w-3 h-3 text-accent shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* 3. What We Do — Interactive Client-POV Discipline Stage */}
      <section
        id="what-we-do"
        aria-labelledby="what-we-do-heading"
        className="bg-canvas text-ink border-b border-ink/15 transition-colors duration-200"
      >
        <div className="max-w-[1380px] mx-auto px-5 sm:px-8 lg:px-12 py-18 sm:py-24">
          <SectionHeading
            eyebrow="What We Make"
            title={
              <span id="what-we-do-heading" className="uppercase">
                Five Ways{' '}
                <br />
                We Help.
              </span>
            }
            subtitle="Select any discipline to see when it fits your goals—and jump straight into a brief."
            align="split"
          />

          <div className="mt-10">
            <ServiceList
              services={STUDIO_SERVICES}
              onSelectService={(slug) => onNavigate(`/services#${slug}`)}
              onInquireService={(label) =>
                onNavigate(`/contact?service=${encodeURIComponent(label)}`)
              }
            />
          </div>
        </div>
      </section>

      {/* 4. Interactive 4-Act Collaboration Process */}
      <section
        aria-labelledby="approach-heading"
        className="bg-contrast text-ink-contrast border-b border-ink/15 transition-colors duration-200"
      >
        <div className="max-w-[1380px] mx-auto px-5 sm:px-8 lg:px-12 py-18 sm:py-24">
          <SectionHeading
            eyebrow="Working With Us"
            dark
            title={
              <span id="approach-heading" className="uppercase">
                How An Idea{' '}
                <br />
                Becomes Real.
              </span>
            }
            subtitle="Click through our four stages to see how a project moves from your first question to launch."
            align="split"
          />

          {/* Animated Stepper Rule */}
          <div className="mt-10 h-px w-full bg-ink-contrast/15 relative overflow-hidden">
            <motion.div
              aria-hidden="true"
              animate={{ scaleX: progressFraction }}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { duration: 0.35, ease: [0.16, 1, 0.3, 1] }
              }
              className="h-full w-full bg-accent origin-left"
            />
          </div>

          <div ref={processEntrance.containerRef}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-b border-ink-contrast/15">
              {APPROACH_STAGES.map((stage, idx) => {
                const isActive = idx === activeStageIdx;

                return (
                  <motion.div
                    key={stage.number}
                    {...processEntrance.getItemProps(idx)}
                    data-stagger-item="process-stage"
                    className="border-b lg:border-b-0 lg:border-r last:border-r-0 last:border-b-0 border-ink-contrast/15 flex"
                  >
                    <button
                      type="button"
                      onClick={() => setActiveStageIdx(idx)}
                      onMouseEnter={() => setActiveStageIdx(idx)}
                      aria-pressed={isActive}
                      className={`w-full text-left pt-7 pb-8 lg:pr-7 lg:pl-7 ${
                        idx === 0 ? 'lg:pl-0' : ''
                      } transition-colors duration-200 cursor-pointer ${
                        isActive ? 'bg-ink-contrast/[0.04]' : 'hover:bg-ink-contrast/[0.02]'
                      }`}
                    >
                      <div className="flex items-baseline justify-between mb-5">
                        <span
                          aria-hidden="true"
                          className={`font-serif italic text-4xl sm:text-5xl leading-none transition-colors duration-200 ${
                            isActive ? 'text-ink-contrast' : 'text-ink-contrast/30'
                          }`}
                        >
                          {stage.roman}
                        </span>
                        <StarMark
                          className={`w-3 h-3 transition-opacity duration-200 ${
                            isActive
                              ? 'text-accent opacity-100'
                              : 'text-ink-contrast/25 opacity-60'
                          }`}
                        />
                      </div>

                      <p
                        className={`font-sans text-xs tracking-[0.24em] tabular-nums mb-2.5 transition-colors ${
                          isActive ? 'text-accent' : 'text-ink-contrast/50'
                        }`}
                      >
                        {stage.number} —
                      </p>

                      <h3 className="font-serif text-2xl tracking-[0.02em] text-ink-contrast mb-3">
                        {stage.title}
                      </h3>

                      <p className="font-sans text-sm leading-relaxed text-ink-contrast/70">
                        {stage.description}
                      </p>
                    </button>
                  </motion.div>
                );
              })}
            </div>

            {/* Live Client Experience Readout */}
            {activeStage ? (
              <motion.div
                {...processEntrance.getItemProps(4)}
                data-stagger-item="process-readout"
                className="pt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
              >
                <div className="lg:col-span-3 flex items-center gap-3">
                  <span className="inline-block w-2 h-2 bg-signal shrink-0" aria-hidden="true" />
                  <span className="font-sans text-xs uppercase tracking-[0.22em] text-ink-contrast/70 tabular-nums">
                    Stage {activeStage.number} · For You
                  </span>
                </div>

                <div className="lg:col-span-9 min-h-[3.5rem] flex items-center">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={activeStage.number}
                      initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -4 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className="font-serif italic text-xl sm:text-2xl leading-snug text-ink-contrast/95 max-w-3xl"
                    >
                      {activeStage.clientExperience}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </motion.div>
            ) : null}
          </div>
        </div>
      </section>

      {/* 5. Distilled Studio Philosophy Note */}
      <section
        aria-labelledby="philosophy-heading"
        className="bg-canvas text-ink border-b border-ink/15 transition-colors duration-200"
      >
        <div className="max-w-[1380px] mx-auto px-5 sm:px-8 lg:px-12 py-18 sm:py-24">
          <div
            ref={philosophyEntrance.containerRef}
            className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center"
          >
            <motion.div
              {...philosophyEntrance.getItemProps(0)}
              data-stagger-item="philosophy-crest"
              className="lg:col-span-4 flex items-center gap-6 editorial-media-frame"
            >
              <div className="overflow-hidden p-1.5 border border-ink/15 bg-canvas-elevated shrink-0">
                <LyreMark className="editorial-media-target w-14 h-16 text-ink" />
              </div>
              <div className="space-y-1">
                <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-signal font-medium">
                  Orpheus Studios
                </p>
                <p className="font-sans text-xs text-ink/70">{STUDIO_CONFIG.location}</p>
                <a
                  href="/about"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('/about');
                  }}
                  className="editorial-link inline-flex font-sans text-xs uppercase tracking-[0.18em] font-medium text-ink hover:text-accent pt-2 transition-colors"
                >
                  <span>About the Studio</span>
                  <span aria-hidden="true">↗</span>
                </a>
              </div>
            </motion.div>

            <motion.div
              {...philosophyEntrance.getItemProps(1)}
              data-stagger-item="philosophy-statement"
              className="lg:col-span-8"
            >
              <h2
                id="philosophy-heading"
                className="font-serif text-2xl sm:text-4xl lg:text-[2.75rem] leading-[1.15] tracking-[-0.015em] text-ink"
              >
                We believe the best work does more than look good—it makes people feel something and
                gives an idea a reason to matter.
              </h2>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 6. Direct Collaboration CTA */}
      <ContactCTA onNavigate={onNavigate} />
    </>
  );
}
