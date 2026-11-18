import React from 'react';
import { ABOUT_CHAPTERS, STUDIO_CONFIG } from '../data/studioData';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { ContactCTA } from '../components/ContactCTA';
import { LyreMark, StarMark } from '../components/LyreLogo';
import { Reveal } from '../components/Reveal';

interface AboutPageProps {
  onNavigate: (path: string) => void;
}

export function AboutPage({ onNavigate }: AboutPageProps) {
  useDocumentMeta({ routeId: 'about' });
  return (
    <>
      <section className="bg-canvas text-ink border-b border-ink/15 transition-colors duration-200">
        <div className="max-w-[1380px] mx-auto px-5 sm:px-8 lg:px-12 pt-14 sm:pt-20 pb-14 sm:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
            <div className="lg:col-span-8 space-y-6">
              <Reveal delay={0} y={10}>
                <div className="flex items-center gap-3">
                  <StarMark className="w-3.5 h-3.5 text-accent shrink-0" />
                  <p className="font-sans text-xs uppercase tracking-[0.24em] text-ink/70">
                    About Orpheus Studios
                  </p>
                </div>
              </Reveal>
              <Reveal variant="mask-up" delay={0.08}>
                <h1 className="font-serif text-4xl sm:text-5xl lg:text-[4rem] leading-[1.04] tracking-[-0.015em] uppercase text-ink">
                  Named For A Storyteller.{' '}
                  <br />
                  Built For The Stories Ahead.
                </h1>
              </Reveal>
              <Reveal delay={0.14}>
                <p className="font-sans text-base sm:text-lg leading-relaxed text-ink/80 max-w-2xl">
                  Based at {STUDIO_CONFIG.location} and {STUDIO_CONFIG.availability.toLowerCase()},
                  bringing strategy, filmmaking and design under one roof.
                </p>
              </Reveal>
            </div>

            <Reveal delay={0.16} className="lg:col-span-4">
              <div className="editorial-media-frame border border-ink/15 hover:border-ink/35 bg-canvas-elevated p-7 sm:p-8 flex items-center justify-between gap-6 overflow-hidden transition-colors duration-200">
                <div className="overflow-hidden shrink-0">
                  <LyreMark className="editorial-media-target w-16 h-20 text-ink" />
                </div>
                <div className="space-y-2 text-right">
                  <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-accent font-medium">
                    Studio Seat
                  </p>
                  <p className="font-serif text-lg leading-snug text-ink">
                    NSTP, NUST
                    <br />
                    Islamabad, Pakistan
                  </p>
                  <p className="font-sans text-xs text-ink/65">
                    {STUDIO_CONFIG.instagram}
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-canvas text-ink transition-colors duration-200">
        <div className="max-w-[1380px] mx-auto px-5 sm:px-8 lg:px-12 divide-y divide-ink/15">
          {ABOUT_CHAPTERS.map((chapter) => (
            <article key={chapter.number} className="py-14 sm:py-18">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
                <div className="lg:col-span-4 space-y-2">
                  <Reveal delay={0} y={10}>
                    <p className="font-sans text-xs tracking-[0.24em] text-accent tabular-nums">
                      {chapter.number} — {chapter.subtitle.toUpperCase()}
                    </p>
                  </Reveal>
                  <Reveal variant="mask-up" delay={0.06}>
                    <h2 className="font-serif text-2xl sm:text-3xl leading-snug text-ink">
                      {chapter.title}
                    </h2>
                  </Reveal>
                </div>

                <div className="lg:col-span-8 space-y-6 max-w-2xl">
                  <Reveal delay={0.1}>
                    <p className="font-sans text-base sm:text-[17px] leading-[1.75] text-ink/85">
                      {chapter.body}
                    </p>
                  </Reveal>

                  {chapter.quote ? (
                    <Reveal delay={0.16}>
                      <blockquote className="pt-7 pb-6 mt-6 border-t border-b border-ink/15">
                        <p className="font-serif italic text-2xl sm:text-[1.7rem] leading-snug text-ink">
                          &ldquo;{chapter.quote}&rdquo;
                        </p>
                      </blockquote>
                    </Reveal>
                  ) : null}
                </div>
              </div>
            </article>
          ))}

          <article className="py-14 sm:py-18">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-baseline">
              <div className="lg:col-span-4 space-y-2">
                <Reveal delay={0} y={10}>
                  <p className="font-sans text-xs tracking-[0.24em] text-signal tabular-nums">
                    05 — COLLABORATION
                  </p>
                </Reveal>
                <Reveal variant="mask-up" delay={0.06}>
                  <h2 className="font-serif text-2xl sm:text-3xl leading-snug text-ink">
                    READY WHEN YOU ARE
                  </h2>
                </Reveal>
              </div>

              <Reveal delay={0.12} className="lg:col-span-8 space-y-6 max-w-2xl">
                <p className="font-sans text-base sm:text-[17px] leading-[1.75] text-ink/85">
                  We take on a focused slate of work each season so every project receives direct
                  creative leadership from start to finish.
                </p>
                <div className="flex flex-wrap items-center gap-6 pt-1">
                  <a
                    href="/services"
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate('/services');
                    }}
                    className="editorial-link font-sans text-xs uppercase tracking-[0.2em] font-medium text-ink hover:text-accent py-1 transition-colors"
                  >
                    <span>Explore Services</span>
                    <span aria-hidden="true">↗</span>
                  </a>
                  <a
                    href="/contact"
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate('/contact');
                    }}
                    className="editorial-link font-sans text-xs uppercase tracking-[0.2em] font-medium text-accent hover:text-ink py-1 transition-colors"
                  >
                    <span>Start a Dialogue</span>
                    <span aria-hidden="true">↗</span>
                  </a>
                </div>
              </Reveal>
            </div>
          </article>
        </div>
      </section>

      <ContactCTA onNavigate={onNavigate} />
    </>
  );
}
