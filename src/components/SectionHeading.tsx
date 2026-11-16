import React from 'react';

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
  const textColor = dark ? 'text-parchment' : 'text-obsidian';
  const mutedColor = dark ? 'text-parchment/65' : 'text-obsidian/65';
  const eyebrowColor = dark ? 'text-parchment/70' : 'text-obsidian/70';

  if (align === 'split') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-end pb-8 border-b border-current/15">
        <div className="lg:col-span-7">
          <p className={`text-xs font-sans uppercase tracking-[0.22em] mb-4 ${eyebrowColor}`}>
            {accentNumber ? (
              <span className="text-vermilion font-medium mr-2 tabular-nums">{accentNumber}</span>
            ) : null}
            {eyebrow}
          </p>
          <h2
            className={`font-serif text-3xl sm:text-4xl lg:text-[2.85rem] leading-[1.08] tracking-[-0.015em] ${textColor}`}
          >
            {title}
          </h2>
        </div>
        {subtitle ? (
          <div className="lg:col-span-5">
            <p className={`font-sans text-base leading-relaxed max-w-md ${mutedColor}`}>
              {subtitle}
            </p>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <p className={`text-xs font-sans uppercase tracking-[0.22em] mb-4 ${eyebrowColor}`}>
        {accentNumber ? (
          <span className="text-vermilion font-medium mr-2 tabular-nums">{accentNumber}</span>
        ) : null}
        {eyebrow}
      </p>
      <h2
        className={`font-serif text-3xl sm:text-4xl lg:text-[2.85rem] leading-[1.08] tracking-[-0.015em] ${textColor}`}
      >
        {title}
      </h2>
      {subtitle ? (
        <p className={`mt-5 font-sans text-base sm:text-lg leading-relaxed max-w-2xl ${mutedColor}`}>
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
