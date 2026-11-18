import React, { useEffect } from 'react';
import { motion, useReducedMotion, useScroll, useSpring } from 'motion/react';
import { RouteId } from '../lib/router';

interface ReadingProgressBarProps {
  routeKey: RouteId;
}

export function ReadingProgressBar({ routeKey }: ReadingProgressBarProps) {
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 34,
    restDelta: 0.001,
  });

  useEffect(() => {
    smoothProgress.jump(0);
  }, [routeKey, smoothProgress]);

  return (
    <div
      aria-hidden="true"
      data-testid="reading-progress-bar"
      className="fixed top-0 left-0 right-0 z-[45] h-[2px] bg-ink/10 pointer-events-none"
    >
      <motion.div
        data-testid="reading-progress-fill"
        style={{ scaleX: shouldReduceMotion ? scrollYProgress : smoothProgress }}
        className="h-full w-full bg-accent origin-left will-change-transform"
      />
    </div>
  );
}
