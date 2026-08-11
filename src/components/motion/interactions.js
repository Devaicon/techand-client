"use client";

import { useReducedMotion } from "motion/react";
import { SPRING } from "./tokens";

/**
 * Hover and press presets.
 *
 * The admin panel already had hover states before this module existed — they
 * were just written one at a time, so a card lifted here, a button changed
 * colour there, and a third thing did nothing. These presets exist to make the
 * physical response consistent; the colour changes stay in Tailwind where they
 * belong.
 *
 *   const press = useInteraction("button");
 *   <motion.button {...press} className="…">
 *
 * ## Transform only, on purpose
 *
 * None of these animate `boxShadow`, `background` or `borderColor`, even where
 * that is the effect wanted. Shadow and colour are not composited properties —
 * animating them from JavaScript repaints the element every frame, and on a
 * grid of twenty cards under a moving pointer that is genuinely visible.
 * Transform and opacity are handled by the compositor and cost nothing. So the
 * rule here is: movement comes from Motion, colour and shadow come from a
 * Tailwind `transition-colors` / `transition-shadow` class on the same element.
 */

const PRESETS = {
  /** A clickable card or tile. Lifts a little; presses back past its origin. */
  card: {
    whileHover: { y: -3 },
    whileTap: { y: -1, scale: 0.995 },
  },

  /** A primary or secondary button. */
  button: {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.97 },
  },

  /**
   * A row in a list or table. Nudges sideways rather than lifting: rows sit
   * flush against their neighbours, and a vertical lift on one of them reads
   * as the list itself shifting.
   */
  row: {
    whileHover: { x: 3 },
    whileTap: { x: 1 },
  },

  /** A small icon-only control — close buttons, kebab menus, toolbar icons. */
  icon: {
    whileHover: { scale: 1.12 },
    whileTap: { scale: 0.92 },
  },

  /** For large surfaces where a normal scale would be far too much travel. */
  subtle: {
    whileHover: { scale: 1.006 },
    whileTap: { scale: 0.998 },
  },
};

export function useInteraction(kind = "button") {
  const reduced = useReducedMotion();

  // Nothing at all under reduced motion — not a smaller movement. Any residual
  // transform that tracks the pointer is exactly the class of animation the
  // preference is asking to be rid of. Whatever Tailwind colour transition sits
  // on the element still runs, so the control is not left without feedback.
  if (reduced) return {};

  return {
    ...(PRESETS[kind] ?? PRESETS.button),
    // A spring, not a duration. These are the only animations in the panel the
    // author can interrupt mid-flight by moving the pointer away, and a spring
    // resolves from its current velocity where a tween would restart. See the
    // note on SPRING in tokens.js.
    transition: SPRING,
  };
}
