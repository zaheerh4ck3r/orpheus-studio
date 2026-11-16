import React from 'react';
import { STUDIO_SERVICES } from '../data/studioData';
import { ContactCTA } from '../components/ContactCTA';
import { StarMark } from '../components/LyreLogo';
import { Reveal } from '../components/Reveal';

interface ServicesPageProps {
  onNavigate: (path: string) => void;
}

export function ServicesPage({ onNavigate }: ServicesPageProps) {
  const scrollToDiscipline = (slug: string) => {
    const el = document.getElementById(slug);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <section className="bg-parchment text-obsidian border-b border-obsidian/15">
        <div className="max-w-[1380px] mx-auto px-5 sm:px-8 lg:px-12 pt-14 sm:pt-20 pb-14 sm:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
            <Reveal className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-3">
                <StarMark className="w-3.5 h-3.5 text-vermilion shrink-0" />
                <p className="font-sans text-xs uppercase tracking-[0.24em] text-obsidian/70">
                  Capabilities &amp; Practice
                </p>
              </div>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-[4rem] leading-[1.03] tracking-[-0.015em] uppercase text-obsidian">
                Strategy With Feeling.{' '}
                <br />
                Art With Purpose.
              </h1>
              <p className="font-sans text-base sm:text-lg leading-relaxed text-obsidian/80 max-w-xl">
                Thinking and making stay under one roof—so what you plan in strategy is what
                audiences actually feel on screen.
              </p>
            </Reveal>

            <Reveal delay={0.08} className="lg:col-span-5">
              <nav
                aria-label="Jump to service discipline"
                className="border-t border-obsidian/15 divide-y divide-obsidian/15"
              >
                {STUDIO_SERVICES.map((service) => (
                  <button
                    key={service.slug}
                    type="button"
                    onClick={() => scrollToDiscipline(service.slug)}
                    className="w-full py-3 flex items-center justify-between gap-4 text-left group cursor-pointer hover:bg-obsidian/[0.025] px-2 -mx-2 transition-colors"
                  >
                    <span className="flex items-baseline gap-3">
                      <span className="font-sans text-xs tracking-[0.2em] text-vermilion tabular-nums font-medium">
                        {service.number}
                      </span>
                      <span className="font-serif text-base sm:text-lg text-obsidian group-hover:text-vermilion transition-colors">
                        {service.title}
                      </span>
                    </span>
                    <span
                      aria-hidden="true"
                      className="text-xs text-obsidian/45 group-hover:text-vermilion transition-colors"
                    >
                      ↓
                    </span>
                  </button>
                ))}
              </nav>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-parchment text-obsidian">
        <div className="max-w-[1380px] mx-auto px-5 sm:px-8 lg:px-12 divide-y divide-obsidian/15">
          {STUDIO_SERVICES.map((service) => (
            <article
              key={service.slug}
              id={service.slug}
              className="py-14 sm:py-20 scroll-mt-24"
            >
              <Reveal>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
                  <div className="lg:col-span-5 space-y-4">
                    <p className="font-sans text-xs tracking-[0.24em] text-vermilion tabular-nums font-medium">
                      DISCIPLINE {service.number}
                    </p>
                    <h2 className="font-serif text-3xl sm:text-4xl leading-tight text-obsidian">
                      {service.title}
                    </h2>
                    <p className="font-serif italic text-lg sm:text-xl leading-snug text-obsidian/80">
                      “{service.coreQuestion}”
                    </p>
                    <div className="pt-3">
                      <button
                        type="button"
                        onClick={() =>
                          onNavigate(`/contact?service=${encodeURIComponent(service.inquiryLabel)}`)
                        }
                        className="inline-flex items-center gap-2 bg-obsidian text-parchment px-5 py-2.5 text-xs font-sans font-medium uppercase tracking-[0.18em] hover:bg-vermilion transition-colors duration-200 cursor-pointer"
                      >
                        <span>Discuss {service.inquiryLabel}</span>
                        <span aria-hidden="true">↗</span>
                      </button>
                    </div>
                  </div>

                  <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8">
                    <div className="space-y-2">
                      <h3 className="font-sans text-[11px] uppercase tracking-[0.22em] text-obsidian/55">
                        When You Need This
                      </h3>
                      <p className="font-sans text-[15px] leading-relaxed text-obsidian/85">
                        {service.userNeed}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-sans text-[11px] uppercase tracking-[0.22em] text-cobalt">
                        What Changes
                      </h3>
                      <p className="font-sans text-[15px] leading-relaxed text-obsidian/85">
                        {service.outcome}
                      </p>
                    </div>

                    <div className="sm:col-span-2 pt-6 border-t border-obsidian/12 space-y-3">
                      <h3 className="font-sans text-[11px] uppercase tracking-[0.22em] text-obsidian/55">
                        What You Leave With
                      </h3>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                        {service.deliverables.map((item) => (
                          <li
                            key={item}
                            className="font-sans text-sm text-obsidian/85 flex items-baseline gap-2.5"
                          >
                            <span className="text-vermilion text-xs" aria-hidden="true">
                              —
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </Reveal>
            </article>
          ))}
        </div>
      </section>

      <ContactCTA onNavigate={onNavigate} />
    </>
  );
}
