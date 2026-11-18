import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';

export const EDITORIAL_EASE = [0.16, 1, 0.3, 1] as const;

export interface IntersectionObserverOptions {
  threshold?: number | number[];
  rootMargin?: string;
  once?: boolean;
}

export interface StaggeredEntranceOptions extends IntersectionObserverOptions {
  baseDelay?: number;
  staggerDelay?: number;
  duration?: number;
  distance?: number;
}

/**
 * Pure delay calculator for staggered editorial entrances.
 */
export function computeStaggerDelay(
  index: number,
  baseDelay = 0.04,
  staggerDelay = 0.085
): number {
  const safeIndex = Math.max(0, index);
  const safeBase = Math.max(0, baseDelay);
  const safeStep = Math.max(0, staggerDelay);
  return Number((safeBase + safeIndex * safeStep).toFixed(4));
}

/**
 * Native IntersectionObserver hook that observes when an element enters the viewport.
 * Falls back gracefully to visible when IntersectionObserver is unavailable.
 */
export function useIntersectionObserver<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.1,
  rootMargin = '0px 0px -36px 0px',
  once = true,
}: IntersectionObserverOptions = {}) {
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return typeof window.IntersectionObserver === 'undefined';
  });

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof window === 'undefined' || typeof window.IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new window.IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (once) {
              observer.unobserve(entry.target);
            }
          } else if (!once) {
            setIsVisible(false);
          }
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [once, rootMargin, threshold]);

  return { ref, isVisible };
}

/**
 * IntersectionObserver-driven hook that produces staggered motion props for sequential
 * elements (service rows, collaboration stages, philosophy blocks), honoring reduced motion.
 */
export function useStaggeredEntrance<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.1,
  rootMargin = '0px 0px -36px 0px',
  once = true,
  baseDelay = 0.04,
  staggerDelay = 0.085,
  duration = 0.62,
  distance = 18,
}: StaggeredEntranceOptions = {}) {
  const { ref: containerRef, isVisible } = useIntersectionObserver<T>({
    threshold,
    rootMargin,
    once,
  });
  const shouldReduceMotion = Boolean(useReducedMotion());
  const entered = shouldReduceMotion || isVisible;

  const getItemProps = (index: number) => {
    if (shouldReduceMotion) {
      return {
        initial: false as const,
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0 },
        'data-entered': 'true',
      };
    }

    const hiddenState = { opacity: 0, y: distance };
    const visibleState = { opacity: 1, y: 0 };

    return {
      initial: hiddenState,
      animate: entered ? visibleState : hiddenState,
      transition: {
        duration,
        delay: entered ? computeStaggerDelay(index, baseDelay, staggerDelay) : 0,
        ease: EDITORIAL_EASE,
      },
      'data-entered': entered ? 'true' : 'false',
    };
  };

  return {
    containerRef,
    isVisible: entered,
    shouldReduceMotion,
    getItemProps,
  };
}
