import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { RouteId } from '../lib/router';
import { StarMark } from './LyreLogo';

interface PageTransitionOverlayProps {
  routeKey: RouteId;
}

const EDITORIAL_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/**
 * Global non-blocking page-loading transition veil that softens route changes
 * with a brief compositor-only opacity & scale settle under the active theme.
 */
export function PageTransitionOverlay({ routeKey }: PageTransitionOverlayProps) {
  const shouldReduceMotion = useReducedMotion();
  const isFirstRenderRef = useRef(true);
  const [transitionId, setTransitionId] = useState<number | null>(null);

  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }

    const nextId = Date.now();
    setTransitionId(nextId);

    const timer = window.setTimeout(
      () => {
        setTransitionId((current) => (current === nextId ? null : current));
      },
      shouldReduceMotion ? 130 : 340
    );

    return () => window.clearTimeout(timer);
  }, [routeKey, shouldReduceMotion]);

  return (
    <AnimatePresence>
      {transitionId !== null ? (
        <motion.div
          key={transitionId}
          aria-hidden="true"
          data-testid="page-transition-overlay"
          initial={{ opacity: shouldReduceMotion ? 0.25 : 0.52 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: shouldReduceMotion ? 0.12 : 0.32,
            ease: EDITORIAL_EASE,
          }}
          style={{ willChange: 'opacity' }}
          className="pointer-events-none fixed inset-0 z-30 flex items-center justify-center bg-canvas"
        >
          {!shouldReduceMotion ? (
            <motion.div
              initial={{ opacity: 0.7, scale: 0.9 }}
              animate={{ opacity: 0, scale: 1.08 }}
              transition={{ duration: 0.3, ease: EDITORIAL_EASE }}
              style={{ willChange: 'transform, opacity' }}
              className="flex flex-col items-center gap-2"
            >
              <StarMark className="w-4 h-4 text-accent" />
              <span className="h-px w-10 bg-ink/25" />
            </motion.div>
          ) : null}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
