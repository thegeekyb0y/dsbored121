import type { Transition } from "motion/react";

/**
 * Shared motion presets. Durations mirror the CSS tokens in globals.css so
 * JS-driven and CSS-driven motion stay in sync.
 */
export const spring = {
  press: { type: "spring", duration: 0.12, bounce: 0 } as Transition,
  ui: { type: "spring", duration: 0.32, bounce: 0.18 } as Transition,
  reveal: { type: "spring", duration: 0.55, bounce: 0.08 } as Transition,
};

export const tween = {
  out: { duration: 0.18, ease: [0.215, 0.61, 0.355, 1] } as Transition,
  expo: { duration: 0.52, ease: [0.16, 1, 0.3, 1] } as Transition,
};

export const stagger = {
  container: { transition: { staggerChildren: 0.06 } },
  item: { transition: spring.ui },
};
