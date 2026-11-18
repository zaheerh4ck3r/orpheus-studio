import React, { useRef } from 'react';
import { motion, useInView, useReducedMotion, Variants } from 'motion/react';

const EDITORIAL_EASE = [0.16, 1, 0.3, 1] as const;

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
  variant?: 'fade-up' | 'fade' | 'mask-up';
  className?: string;
}

/**
 * IntersectionObserver-driven reveal for section titles, editorial plates, and text blocks.
 * Uses motion/react useInView (IntersectionObserver) and honors prefers-reduced-motion.
 */
export function Reveal({
  children,
  delay = 0,
  duration = 0.65,
  y = 18,
  variant = 'fade-up',
  className = '',
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    once: true,
    amount: 0.08,
    margin: '0px 0px -32px 0px',
  });
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  if (variant === 'mask-up') {
    return (
      <div ref={ref} className={`overflow-hidden ${className}`}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration, delay, ease: EDITORIAL_EASE }}
        >
          {children}
        </motion.div>
      </div>
    );
  }

  const initialState = variant === 'fade' ? { opacity: 0 } : { opacity: 0, y };
  const visibleState = variant === 'fade' ? { opacity: 1 } : { opacity: 1, y: 0 };

  return (
    <motion.div
      ref={ref}
      initial={initialState}
      animate={isInView ? visibleState : initialState}
      transition={{ duration, delay, ease: EDITORIAL_EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerRevealProps {
  children: React.ReactNode;
  staggerDelay?: number;
  delayChildren?: number;
  className?: string;
}

const staggerContainerVariants: Variants = {
  hidden: {},
  visible: (custom: { staggerDelay: number; delayChildren: number }) => ({
    transition: {
      staggerChildren: custom.staggerDelay,
      delayChildren: custom.delayChildren,
    },
  }),
};

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: EDITORIAL_EASE,
    },
  },
};

export function StaggerReveal({
  children,
  staggerDelay = 0.09,
  delayChildren = 0.04,
  className = '',
}: StaggerRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    once: true,
    amount: 0.08,
    margin: '0px 0px -32px 0px',
  });
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      variants={staggerContainerVariants}
      custom={{ staggerDelay, delayChildren }}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div variants={staggerItemVariants} className={className}>
      {children}
    </motion.div>
  );
}
