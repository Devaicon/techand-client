"use client";

import { useReducedMotion } from "motion/react";
import { DURATION, EASE, DISTANCE } from "./tokens";

/**
 * The entrance vocabulary, shared by `Reveal` and `Stagger`.
 *
 * Both need the identical set of named starting states, and both need the same
 * reduced-motion rule applied to them. Keeping that in one place is what stops
 * `<Reveal variant="rise">` and `<StaggerItem variant="rise">` from drifting
 * into meaning two slightly different things.
 */

/**
 * Each entry is only the *hidden* half. The visible half is always the element
 * at rest — opacity 1, no offset, no scale — so it is derived rather than
 * written out five times, and a component's resting appearance is never
 * something this module asserts.
 */
const HIDDEN = {
  fade: { opacity: 0 },
  rise: { opacity: 0, y: DISTANCE.rise },
  fall: { opacity: 0, y: -DISTANCE.rise },
  scale: { opacity: 0, scale: 0.96 },
  slideLeft: { opacity: 0, x: DISTANCE.slide },
  slideRight: { opacity: 0, x: -DISTANCE.slide },
};

export const VARIANT_NAMES = Object.keys(HIDDEN);

/** The resting state for whichever axes a given hidden state disturbs. */
const shownFor = (hidden) => ({
  opacity: 1,
  ...("y" in hidden ? { y: 0 } : null),
  ...("x" in hidden ? { x: 0 } : null),
  ...("scale" in hidden ? { scale: 1 } : null),
});

/**
 * Resolves a variant name into a `{ hidden, shown, transition }` triple,
 * honouring the reader's reduced-motion preference.
 *
 * Reduced motion collapses every variant to a plain opacity fade rather than
 * removing the animation outright. The preference is about *movement* —
 * vestibular triggers are travel and scale, not a change in opacity — and a
 * fade still answers the question the animation exists to answer, which is
 * "did this region just change?". Cutting to nothing would make the panel
 * snappier for exactly the users least able to track an instant swap.
 *
 * Note this is a hook: Motion reads the media query and re-renders on change,
 * so a user toggling the OS setting sees it take effect without a reload.
 */
export function useEntrance(variant = "rise", { duration, delay = 0 } = {}) {
  const reduced = useReducedMotion();

  const hidden = reduced
    ? HIDDEN.fade
    : (HIDDEN[variant] ?? HIDDEN.rise);

  return {
    hidden,
    shown: shownFor(hidden),
    transition: {
      // A reduced-motion fade is shortened as well as flattened. Without the
      // movement there is nothing left to track, so the base duration would
      // just be a delay before the content is readable.
      duration: reduced ? DURATION.fast : (duration ?? DURATION.base),
      ease: EASE.out,
      delay,
    },
  };
}
