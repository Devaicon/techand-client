"use client";

import { useReducedMotion } from "motion/react";
import { DURATION, EASE, DISTANCE } from "./tokens";

/**
 * Enter and exit presets for things that appear *over* the page — dialogs,
 * dropdown menus, floating panels, drawers, toasts.
 *
 * This is a hook returning props to spread, rather than a wrapper component,
 * because every one of those surfaces already exists in this codebase with its
 * own markup, portal, focus handling and positioning. A wrapper would mean
 * restructuring all of it; a prop bag means adding one line:
 *
 *   const dialog = useOverlayMotion("modal");
 *   <motion.div {...dialog} className="…">
 *
 * ## Exits only happen inside `<AnimatePresence>`
 *
 * React removes an element from the DOM the moment it stops being rendered, so
 * an `exit` prop on its own does nothing at all. The element must be wrapped —
 * `<AnimatePresence>{open && <motion.div {...dialog} />}</AnimatePresence>` —
 * and it needs a stable `key` if more than one child can be present. Without
 * the wrapper the enter animation still works and the exit is silently
 * skipped, which is a confusing thing to debug, so it is worth checking first.
 */

const PRESETS = {
  /** The dimmed sheet behind a dialog. Opacity only — it has no shape to move. */
  backdrop: {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },

  /**
   * A centred dialog. Rises slightly and scales up from just under full size.
   * Starting *below* 1 rather than above reads as the dialog coming forward to
   * meet the author; scaling down from 1.04 reads as it retreating, which is
   * the wrong direction for something demanding attention.
   */
  modal: {
    from: { opacity: 0, scale: 0.96, y: 8 },
    to: { opacity: 1, scale: 1, y: 0 },
  },

  /**
   * A dropdown or context menu. Nearly no travel and a very short duration:
   * a menu is opened with the intent of immediately clicking something in it,
   * so any animation long enough to notice is an animation in the way.
   *
   * Set `transform-origin` in CSS at the call site to match the corner the menu
   * is anchored to — otherwise it grows from its centre while being pinned by
   * one corner, and the whole thing appears to slide.
   */
  menu: {
    from: { opacity: 0, scale: 0.96, y: -4 },
    to: { opacity: 1, scale: 1, y: 0 },
    duration: DURATION.fast,
  },

  /** A floating window. Scale only, no travel — it owns an absolute position. */
  panel: {
    from: { opacity: 0, scale: 0.98 },
    to: { opacity: 1, scale: 1 },
    duration: DURATION.fast,
  },

  /** A side drawer. Slides from the right edge it is docked to. */
  drawer: {
    from: { opacity: 0, x: DISTANCE.slide },
    to: { opacity: 1, x: 0 },
    duration: DURATION.slow,
  },

  /** A toast entering the corner stack. */
  toast: {
    from: { opacity: 0, y: 12, scale: 0.98 },
    to: { opacity: 1, y: 0, scale: 1 },
    duration: DURATION.fast,
  },
};

export function useOverlayMotion(kind = "modal") {
  const reduced = useReducedMotion();
  const preset = PRESETS[kind] ?? PRESETS.modal;

  // As in `entrance.js`: reduced motion keeps the fade and drops the movement,
  // so the surface still announces itself without travelling.
  const from = reduced ? { opacity: 0 } : preset.from;
  const to = reduced ? { opacity: 1 } : preset.to;
  const duration = reduced ? DURATION.instant : (preset.duration ?? DURATION.base);

  return {
    initial: from,
    animate: to,
    // Leaving is consistently quicker than arriving, and uses the opposite
    // curve. A dialog the author has just dismissed is one they have finished
    // with — holding it on screen for as long as it took to arrive feels like
    // the panel arguing about the decision. The timing rides inside the `exit`
    // object rather than in `transition`, which would apply it both ways.
    exit: {
      ...from,
      transition: { duration: DURATION.instant, ease: EASE.exit },
    },
    transition: { duration, ease: EASE.out },
  };
}
