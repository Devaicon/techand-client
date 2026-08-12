/**
 * The motion module.
 *
 * One import for everything animation-related:
 *
 *   import { Reveal, Stagger, StaggerItem, useInteraction } from "@/components/motion";
 *
 * Built on Motion (`motion` on npm — the package formerly published as
 * `framer-motion`, same library and maintainers).
 *
 * ── What to reach for ──────────────────────────────────────────────────────
 *
 *   Reveal            one region fading in on mount
 *   Stagger + Item    a list whose rows arrive one after another
 *   useOverlayMotion  dialogs, menus, floating panels, drawers, toasts
 *   useInteraction    hover and press feedback
 *   Skeleton…         placeholders for the gap before a fetch resolves
 *   DURATION/EASE/…   the raw tokens, for the rare bespoke animation
 *
 * ── The rules that keep this coherent ──────────────────────────────────────
 *
 * 1. Never inline a duration or an easing curve. If a call site needs a timing
 *    the tokens do not cover, add it to tokens.js — otherwise the panel drifts
 *    back to twelve slightly different rhythms, which is what this replaced.
 *
 * 2. Animate transform and opacity, nothing else. Colour, shadow and border
 *    belong to Tailwind's `transition-*` classes on the same element; see the
 *    note in interactions.js for why this is a performance rule, not taste.
 *
 * 3. Reduced motion is handled inside every primitive. Building on the tokens
 *    directly means opting out of that, so call `useReducedMotion()` yourself
 *    when you do.
 *
 * 4. Exit animations need `<AnimatePresence>` around the conditional. An
 *    `exit` prop alone does nothing — React unmounts the element first.
 */

export { default as Reveal } from "./Reveal";
export { default as Stagger, StaggerItem } from "./Stagger";
export { useOverlayMotion } from "./Overlay";
export { useInteraction } from "./interactions";
export {
  default as Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonRows,
} from "./Skeleton";
export { useEntrance, VARIANT_NAMES } from "./entrance";
export { DURATION, EASE, DISTANCE, STAGGER, SPRING } from "./tokens";
