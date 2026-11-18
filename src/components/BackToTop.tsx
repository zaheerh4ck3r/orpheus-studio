import React, { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { shouldShowBackToTop } from '../lib/studioUiHelpers';

interface BackToTopProps {
  routeKey: string;
}

const EDITORIAL_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function BackToTop({ routeKey }: BackToTopProps) {
  const [visible, setVisible] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    let rafId = 0;

    const evaluateVisibility = () => {
      rafId = 0;
      const heroSection = document.querySelector('#main-content section');
      const heroBottom = heroSection ? heroSection.getBoundingClientRect().bottom : null;
      setVisible(shouldShowBackToTop(heroBottom, window.scrollY));
    };

    const scheduleEvaluation = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(evaluateVisibility);
      }
    };

    // Re-evaluate after initial route mount and exit/enter transition settle
    evaluateVisibility();
    const settleTimer = window.setTimeout(evaluateVisibility, 300);

    window.addEventListener('scroll', scheduleEvaluation, { passive: true });
    window.addEventListener('resize', scheduleEvaluation, { passive: true });

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.clearTimeout(settleTimer);
      window.removeEventListener('scroll', scheduleEvaluation);
      window.removeEventListener('resize', scheduleEvaluation);
    };
  }, [routeKey]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: shouldReduceMotion ? 'auto' : 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {visible ? (
        <motion.button
          key="back-to-top"
          type="button"
          onClick={scrollToTop}
          data-testid="back-to-top-button"
          aria-label="Back to top"
          title="Back to top"
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.94 }}
          transition={{ duration: shouldReduceMotion ? 0.1 : 0.22, ease: EDITORIAL_EASE }}
          className="editorial-btn-hover inline-flex items-center justify-center w-11 h-11 bg-canvas-elevated text-ink border border-ink/25 shadow-lg hover:bg-btn hover:text-btn-ink hover:border-btn cursor-pointer shrink-0"
        >
          <ArrowUp className="w-4 h-4" aria-hidden="true" />
        </motion.button>
      ) : null}
    </AnimatePresence>
  );
}
