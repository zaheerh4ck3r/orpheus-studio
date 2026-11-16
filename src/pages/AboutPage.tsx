import React from 'react';
import { ABOUT_CHAPTERS, STUDIO_CONFIG } from '../data/studioData';
import { ContactCTA } from '../components/ContactCTA';
import { LyreMark, StarMark } from '../components/LyreLogo';
import { Reveal } from '../components/Reveal';

interface AboutPageProps {
  onNavigate: (path: string) => void;
}

export function AboutPage({ onNavigate }: AboutPageProps) {
  return (
    <>
      <section className="bg-parchment text-obsidian border-b border-obsidian/15">
        <div className="max-w-[1380px] mx-auto px-5 sm:px-8 lg:px-12 pt-14 sm:pt-20 pb-14 sm:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
            <Reveal className="lg:col-span-8 space-y-6">
              <div className="flex items-center gap-3">
                <StarMark className="w-3.5 h-3.5 text-vermilion shrink-0" />
                <p className="font-sans text-xs uppercase tracking-[0.24em] text-obsidian/70">
                  About Orpheus Studios
                </p>
              </div>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-[4rem] leading-[1.04] tracking-[-0.015em] uppercase text-obsidian">
                Named For A Storyteller.{' '}
                <br />
                Built For The Stories Ahead.
              </h1>
              <p className="font-sans text-base sm:text-lg leading-relaxed text-obsidian/80 max-w-2xl">
                Based at {STUDIO_CONFIG.location} and {STUDIO_CONFIG.availability.toLowerCase()},
                bringing strategy, filmmaking and design under one roof.
              </p>
            </Reveal>

            <Reveal delay={0.08} className="lg:col-span-4">
              <div className="border border-obsidian/15 bg-parchment-deep/55 p-7 sm:p-8 flex items-center justify-between gap-6">
                <LyreMark className="w-16 h-20 text-obsidian shrink-0" />
                <div className="space-y-2 text-right">
                  <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-vermilion font-medium">
                    Studio Seat
                  </p>
                  <p className="font-serif text-lg leading-snug text-obsidian">
                    NSTP, NUST
                    <br />
                    Islamabad, Pakistan
                  </p>
                  <p className="font-sans text-xs text-obsidian/65">
                    {STUDIO_CONFIG.instagram}
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-parchment text-obsidian">
        <div className="max-w-[1380px] mx-auto px-5 sm:px-8 lg:px-12 divide-y divide-obsidian/15">
          {ABOUT_CHAPTERS.map((chapter) => (
            <article key={chapter.number} className="py-14 sm:py-18">
              <Reveal>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
                  <div className="lg:col-span-4 space-y-2">
                    <p className="font-sans text-xs tracking-[0.24em] text-vermilion tabular-nums">
                      {chapter.number} — {chapter.subtitle.toUpperCase()}
                    </p>
                    <h2 className="font-serif text-2xl sm:text-3xl leading-snug text-obsidian">
                      {chapter.title}
                    </h2>
                  </div>

                  <div className="lg:col-span-8 space-y-6 max-w-2xl">
                    <p className="font-sans text-base sm:text-[17px] leading-[1.75] text-obsidian/85">
                      {chapter.body}
                    </p>

                    {chapter.quote ? (
                      <blockquote className="pt-7 pb-6 mt-6 border-t border-b border-obsidian/15">
                        <p className="font-serif italic text-2xl sm:text-[1.7rem] leading-snug text-obsidian">
                          &ldquo;{chapter.quote}&rdquo;
                        </p>
                      </blockquote>
                    ) : null}
                  </div>
                </div>
              </Reveal>
            </article>
          ))}

          <article className="py-14 sm:py-18">
            <Reveal>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-baseline">
                <div className="lg:col-span-4 space-y-2">
                  <p className="font-sans text-xs tracking-[0.24em] text-cobalt tabular-nums">
                    05 — COLLABORATION
                  </p>
                  <h2 className="font-serif text-2xl sm:text-3xl leading-snug text-obsidian">
                    READY WHEN YOU ARE
                  </h2>
                </div>

                <div className="lg:col-span-8 space-y-6 max-w-2xl">
                  <p className="font-sans text-base sm:text-[17px] leading-[1.75] text-obsidian/85">
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
                      className="editorial-link font-sans text-xs uppercase tracking-[0.2em] font-medium text-obsidian hover:text-vermilion py-1 transition-colors"
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
                      className="editorial-link font-sans text-xs uppercase tracking-[0.2em] font-medium text-vermilion hover:text-obsidian py-1 transition-colors"
                    >
                      <span>Start a Dialogue</span>
                      <span aria-hidden="true">↗</span>
                    </a>
                  </div>
                </div>
              </div>
            </Reveal>
          </article>
        </div>
      </section>

      <ContactCTA onNavigate={onNavigate} />
    </>
  );
}
