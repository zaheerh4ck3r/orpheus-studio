import React from 'react';
import { STUDIO_CONFIG } from '../data/studioData';

interface ContactCTAProps {
  onNavigate: (path: string) => void;
}

export function ContactCTA({ onNavigate }: ContactCTAProps) {
  return (
    <section
      aria-labelledby="contact-cta-heading"
      className="bg-vermilion text-parchment"
    >
      <div className="max-w-[1380px] mx-auto px-5 sm:px-8 lg:px-12 py-18 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-end">
          <div className="lg:col-span-7">
            <p className="font-sans text-xs uppercase tracking-[0.24em] text-parchment/80 mb-5">
              New Collaborations
            </p>
            <h2
              id="contact-cta-heading"
              className="font-serif text-4xl sm:text-5xl lg:text-[4rem] leading-[1.02] tracking-[-0.015em] uppercase text-parchment"
            >
              Let&apos;s Make{' '}
              <br />
              Something Matter.
            </h2>
          </div>

          <div className="lg:col-span-5 space-y-8">
            <p className="font-sans text-base sm:text-lg leading-relaxed text-parchment/90 max-w-md">
              Tell us what you are building or hoping to film. You will hear back directly within
              two business days.
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <a
                href="/contact"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('/contact');
                }}
                className="inline-flex items-center justify-center gap-2.5 bg-parchment text-obsidian px-6 py-3.5 text-xs font-sans font-medium uppercase tracking-[0.18em] whitespace-nowrap shrink-0 hover:bg-obsidian hover:text-parchment transition-colors duration-200"
              >
                <span>Start a Conversation</span>
                <span aria-hidden="true">↗</span>
              </a>

              <div className="text-xs font-sans text-parchment/85 space-y-1">
                <span className="block uppercase tracking-[0.18em] text-parchment/65">
                  Direct Email
                </span>
                <a
                  href={`mailto:${STUDIO_CONFIG.email}`}
                  className="editorial-link inline-flex font-medium text-parchment hover:text-obsidian transition-colors"
                >
                  {STUDIO_CONFIG.email}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
