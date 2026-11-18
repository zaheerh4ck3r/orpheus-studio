import React, { useState } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import { STUDIO_CONFIG, STUDIO_IMAGES } from '../data/studioData';
import { LyreMark, StarMark } from './LyreLogo';

interface HeroProps {
  onDiscoverClick: () => void;
  onNavigate: (path: string) => void;
}

export function Hero({ onDiscoverClick, onNavigate }: HeroProps) {
  const shouldReduceMotion = useReducedMotion();
  const [imgError, setImgError] = useState(false);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const offsetX = useSpring(rawX, { stiffness: 140, damping: 24 });
  const offsetY = useSpring(rawY, { stiffness: 140, damping: 24 });

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (shouldReduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    rawX.set(nx * 10);
    rawY.set(ny * 10);
  };

  const handlePointerLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };

  return (
    <section
      aria-labelledby="hero-headline"
      className="bg-canvas text-ink border-b border-ink/15 overflow-x-clip transition-colors duration-200"
    >
      <div className="max-w-[1380px] mx-auto px-5 sm:px-8 lg:px-12 pt-10 sm:pt-14 lg:pt-20 pb-14 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* Left — Visitor-Focused Opening Statement */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 space-y-8"
          >
            <div className="flex items-center gap-3">
              <StarMark className="w-3.5 h-3.5 text-accent shrink-0" />
              <p className="font-sans text-[11px] sm:text-xs uppercase tracking-[0.24em] text-ink/70">
                {STUDIO_CONFIG.shortLocation} · {STUDIO_CONFIG.availability}
              </p>
            </div>

            <h1
              id="hero-headline"
              className="font-serif text-[2.75rem] sm:text-[4.25rem] lg:text-[4.85rem] xl:text-[5.5rem] leading-[0.97] tracking-[-0.02em] text-ink uppercase"
            >
              Make Things{' '}
              <br />
              That <span className="text-accent italic font-normal">Move</span> People.
            </h1>

            <div className="max-w-lg space-y-7 pt-2 border-t border-ink/15">
              <p className="font-sans text-base sm:text-lg leading-relaxed text-ink/80 pt-5">
                Films, brand strategy, identity and digital experiences—built for founders and
                teams who want their work to feel unmistakable.
              </p>

              <div className="flex flex-wrap items-center gap-x-7 gap-y-4">
                <a
                  href="/contact"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('/contact');
                  }}
                  className="editorial-btn-hover inline-flex items-center gap-2.5 bg-btn text-btn-ink px-6 py-3 text-xs font-sans font-medium uppercase tracking-[0.18em] whitespace-nowrap shrink-0 hover:bg-accent hover:text-parchment"
                >
                  <span>Start a Project</span>
                  <span aria-hidden="true">↗</span>
                </a>

                <button
                  type="button"
                  onClick={onDiscoverClick}
                  className="editorial-link font-sans text-xs uppercase tracking-[0.2em] font-medium text-ink/80 hover:text-accent py-1.5 transition-colors cursor-pointer"
                >
                  <span>See What We Do</span>
                  <span aria-hidden="true">↓</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Right — Architectural Brand Crest Presentation */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            className="lg:col-span-5"
          >
            <div className="editorial-media-frame group relative bg-canvas-elevated border border-ink/20 hover:border-ink/35 p-3 sm:p-4 transition-colors duration-200">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-1.5 left-1.5 w-2.5 h-2.5 border-t border-l border-ink/45"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-1.5 right-1.5 w-2.5 h-2.5 border-t border-r border-ink/45"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute bottom-1.5 left-1.5 w-2.5 h-2.5 border-b border-l border-ink/45"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute bottom-1.5 right-1.5 w-2.5 h-2.5 border-b border-r border-ink/45"
              />

              <motion.div
                style={shouldReduceMotion ? undefined : { x: offsetX, y: offsetY }}
                className="relative aspect-square w-full overflow-hidden border border-ink/15 bg-parchment"
              >
                {!imgError ? (
                  <img
                    src={STUDIO_IMAGES.brandCrestImage}
                    alt="Orpheus Studios crest featuring the classical lyre mark, wordmark, vermilion star and tagline"
                    loading="eager"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    onError={() => setImgError(true)}
                    className="editorial-media-target w-full h-full object-cover"
                  />
                ) : (
                  <div className="editorial-media-target w-full h-full flex flex-col items-center justify-center p-8 bg-canvas text-ink text-center">
                    <LyreMark className="w-24 h-28 mb-4 text-ink" />
                    <p className="font-serif text-xl tracking-[0.2em] uppercase">
                      Orpheus Studios
                    </p>
                    <StarMark className="w-3.5 h-3.5 text-accent my-3" />
                    <p className="font-serif italic text-sm text-ink/80">
                      Make things that move people.
                    </p>
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
