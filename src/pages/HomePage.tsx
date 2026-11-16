import React, { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { APPROACH_STAGES, STUDIO_CONFIG, STUDIO_SERVICES } from '../data/studioData';
import { ContactCTA } from '../components/ContactCTA';
import { Hero } from '../components/Hero';
import { LyreMark, StarMark } from '../components/LyreLogo';
import { Reveal } from '../components/Reveal';
import { SectionHeading } from '../components/SectionHeading';
import { ServiceList } from '../components/ServiceList';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const [activeStageIdx, setActiveStageIdx] = useState(0);
  const shouldReduceMotion = useReducedMotion();

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
        className="editorial-marquee bg-parchment-deep/65 text-obsidian border-b border-obsidian/15 overflow-hidden select-none"
      >
        <div className="editorial-marquee-track py-3.5 items-center">
          {ribbonDisciplines.map((service, index) => (
            <div key={`${service.slug}-${index}`} className="flex items-center shrink-0">
              <span className="font-sans text-[11px] uppercase tracking-[0.26em] text-obsidian/80 px-6 whitespace-nowrap">
                {service.number} · {service.title}
              </span>
              <StarMark className="w-3 h-3 text-vermilion shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* 3. What We Do — Interactive Client-POV Discipline Stage */}
      <section
        id="what-we-do"
        aria-labelledby="what-we-do-heading"
        className="bg-parchment text-obsidian border-b border-obsidian/15"
      >
        <div className="max-w-[1380px] mx-auto px-5 sm:px-8 lg:px-12 py-18 sm:py-24">
          <Reveal>
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
          </Reveal>

          <Reveal delay={0.08} className="mt-10">
            <ServiceList
              services={STUDIO_SERVICES}
              onSelectService={(slug) => onNavigate(`/services#${slug}`)}
              onInquireService={(label) =>
                onNavigate(`/contact?service=${encodeURIComponent(label)}`)
              }
            />
          </Reveal>
        </div>
      </section>

      {/* 4. Interactive 4-Act Collaboration Process */}
      <section
        aria-labelledby="approach-heading"
        className="bg-obsidian text-parchment border-b border-parchment/15"
      >
        <div className="max-w-[1380px] mx-auto px-5 sm:px-8 lg:px-12 py-18 sm:py-24">
          <Reveal>
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
          </Reveal>

          {/* Animated Stepper Rule */}
          <div className="mt-10 h-px w-full bg-parchment/15 relative overflow-hidden">
            <motion.div
              aria-hidden="true"
              animate={{ scaleX: progressFraction }}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { duration: 0.35, ease: [0.16, 1, 0.3, 1] }
              }
              className="h-full w-full bg-vermilion origin-left"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-b border-parchment/15">
            {APPROACH_STAGES.map((stage, idx) => {
              const isActive = idx === activeStageIdx;

              return (
                <button
                  key={stage.number}
                  type="button"
                  onClick={() => setActiveStageIdx(idx)}
                  onMouseEnter={() => setActiveStageIdx(idx)}
                  aria-pressed={isActive}
                  className={`text-left pt-7 pb-8 lg:pr-7 lg:pl-7 first:lg:pl-0 border-b lg:border-b-0 lg:border-r last:border-r-0 last:border-b-0 border-parchment/15 transition-colors duration-200 cursor-pointer ${
                    isActive ? 'bg-parchment/[0.04]' : 'hover:bg-parchment/[0.02]'
                  }`}
                >
                  <div className="flex items-baseline justify-between mb-5">
                    <span
                      aria-hidden="true"
                      className={`font-serif italic text-4xl sm:text-5xl leading-none transition-colors duration-200 ${
                        isActive ? 'text-parchment' : 'text-parchment/30'
                      }`}
                    >
                      {stage.roman}
                    </span>
                    <StarMark
                      className={`w-3 h-3 transition-opacity duration-200 ${
                        isActive ? 'text-vermilion opacity-100' : 'text-parchment/25 opacity-60'
                      }`}
                    />
                  </div>

                  <p
                    className={`font-sans text-xs tracking-[0.24em] tabular-nums mb-2.5 transition-colors ${
                      isActive ? 'text-vermilion' : 'text-parchment/50'
                    }`}
                  >
                    {stage.number} —
                  </p>

                  <h3 className="font-serif text-2xl tracking-[0.02em] text-parchment mb-3">
                    {stage.title}
                  </h3>

                  <p className="font-sans text-sm leading-relaxed text-parchment/70">
                    {stage.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Live Client Experience Readout */}
          {activeStage ? (
            <div className="pt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-3 flex items-center gap-3">
                <span className="inline-block w-2 h-2 bg-cobalt shrink-0" aria-hidden="true" />
                <span className="font-sans text-xs uppercase tracking-[0.22em] text-parchment/70 tabular-nums">
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
                    className="font-serif italic text-xl sm:text-2xl leading-snug text-parchment/95 max-w-3xl"
                  >
                    {activeStage.clientExperience}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* 5. Distilled Studio Note */}
      <section
        aria-labelledby="philosophy-heading"
        className="bg-parchment text-obsidian border-b border-obsidian/15"
      >
        <div className="max-w-[1380px] mx-auto px-5 sm:px-8 lg:px-12 py-18 sm:py-24">
          <Reveal>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              <div className="lg:col-span-4 flex items-center gap-6">
                <LyreMark className="w-14 h-16 text-obsidian shrink-0" />
                <div className="space-y-1">
                  <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-cobalt font-medium">
                    Orpheus Studios
                  </p>
                  <p className="font-sans text-xs text-obsidian/70">{STUDIO_CONFIG.location}</p>
                  <a
                    href="/about"
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate('/about');
                    }}
                    className="editorial-link inline-flex font-sans text-xs uppercase tracking-[0.18em] font-medium text-obsidian hover:text-vermilion pt-2 transition-colors"
                  >
                    <span>About the Studio</span>
                    <span aria-hidden="true">↗</span>
                  </a>
                </div>
              </div>

              <div className="lg:col-span-8">
                <h2
                  id="philosophy-heading"
                  className="font-serif text-2xl sm:text-4xl lg:text-[2.75rem] leading-[1.15] tracking-[-0.015em] text-obsidian"
                >
                  We believe the best work does more than look good—it makes people feel something
                  and gives an idea a reason to matter.
                </h2>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 6. Direct Collaboration CTA */}
      <ContactCTA onNavigate={onNavigate} />
    </>
  );
}
