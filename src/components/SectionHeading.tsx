import React, { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';

const EDITORIAL_EASE = [0.16, 1, 0.3, 1] as const;

interface SectionHeadingProps {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
  align?: 'left' | 'split';
  accentNumber?: string;
  dark?: boolean;
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'left',
  accentNumber,
  dark = false,
}: SectionHeadingProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    once: true,
    amount: 0.12,
    margin: '0px 0px -32px 0px',
  });
  const shouldReduceMotion = useReducedMotion();

  const textColor = dark ? 'text-ink-contrast' : 'text-ink';
  const mutedColor = dark ? 'text-ink-contrast/65' : 'text-ink/65';
  const eyebrowColor = dark ? 'text-ink-contrast/70' : 'text-ink/70';
  const ruleColor = dark ? 'bg-ink-contrast/15' : 'bg-ink/15';

  if (align === 'split') {
    return (
      <div ref={ref} className="pb-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-end">
          <div className="lg:col-span-7">
            <motion.p
              initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
              animate={
                shouldReduceMotion || isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }
              }
              transition={{ duration: 0.5, ease: EDITORIAL_EASE }}
              className={`text-xs font-sans uppercase tracking-[0.22em] mb-4 ${eyebrowColor}`}
            >
              {accentNumber ? (
                <span className="text-accent font-medium mr-2 tabular-nums">{accentNumber}</span>
              ) : null}
              {eyebrow}
            </motion.p>

            <div className="overflow-hidden">
              <motion.h2
                initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
                animate={
                  shouldReduceMotion || isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }
                }
                transition={{ duration: 0.65, delay: 0.08, ease: EDITORIAL_EASE }}
                className={`font-serif text-3xl sm:text-4xl lg:text-[2.85rem] leading-[1.08] tracking-[-0.015em] ${textColor}`}
              >
                {title}
              </motion.h2>
            </div>
          </div>

          {subtitle ? (
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
              animate={
                shouldReduceMotion || isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }
              }
              transition={{ duration: 0.6, delay: 0.16, ease: EDITORIAL_EASE }}
              className="lg:col-span-5"
            >
              <p className={`font-sans text-base leading-relaxed max-w-md ${mutedColor}`}>
                {subtitle}
              </p>
            </motion.div>
          ) : null}
        </div>

        <motion.div
          aria-hidden="true"
          initial={shouldReduceMotion ? false : { scaleX: 0 }}
          animate={shouldReduceMotion || isInView ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 0.75, delay: 0.2, ease: EDITORIAL_EASE }}
          className={`absolute bottom-0 left-0 right-0 h-px origin-left ${ruleColor}`}
        />
      </div>
    );
  }

  return (
    <div ref={ref} className="max-w-3xl">
      <motion.p
        initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
        animate={shouldReduceMotion || isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        transition={{ duration: 0.5, ease: EDITORIAL_EASE }}
        className={`text-xs font-sans uppercase tracking-[0.22em] mb-4 ${eyebrowColor}`}
      >
        {accentNumber ? (
          <span className="text-accent font-medium mr-2 tabular-nums">{accentNumber}</span>
        ) : null}
        {eyebrow}
      </motion.p>

      <div className="overflow-hidden">
        <motion.h2
          initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
          animate={shouldReduceMotion || isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.65, delay: 0.08, ease: EDITORIAL_EASE }}
          className={`font-serif text-3xl sm:text-4xl lg:text-[2.85rem] leading-[1.08] tracking-[-0.015em] ${textColor}`}
        >
          {title}
        </motion.h2>
      </div>

      {subtitle ? (
        <motion.p
          initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
          animate={shouldReduceMotion || isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
          transition={{ duration: 0.6, delay: 0.16, ease: EDITORIAL_EASE }}
          className={`mt-5 font-sans text-base sm:text-lg leading-relaxed max-w-2xl ${mutedColor}`}
        >
          {subtitle}
        </motion.p>
      ) : null}
    </div>
  );
}
