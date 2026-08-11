/**
 * Motion tokens — the single source of truth for how this product moves.
 *
 * Every animation in the admin panel reads its timing from here rather than
 * inlining numbers at the call site. The reason is consistency, not tidiness:
 * animation is one of the few kinds of styling where being slightly wrong is
 * worse than being absent. Twelve components each picking "about 300ms, some
 * ease-out" produce twelve subtly different rhythms, and the panel reads as
 * jittery without anyone being able to point at which element is at fault.
 *
 * These are seconds, not milliseconds — Motion's unit. The one exception is
 * the CSS shimmer in globals.css, which is written in ms because CSS wants it.
 */

/**
 * Four durations, and a strong bias toward the short end.
 *
 * An admin panel is a tool the author uses all day, not a landing page they
 * see once. Anything that reads as "smooth" on first sight becomes latency by
 * the fiftieth repetition, so the defaults here are quicker than a marketing
 * site would use. `slow` exists for large surfaces (a full-height drawer)
 * where a fast move looks like a glitch, not for emphasis.
 */
export const DURATION = {
  instant: 0.12,
  fast: 0.2,
  base: 0.32,
  slow: 0.45,
};

/**
 * Easing curves.
 *
 * `out` is an expo-out: it covers most of the distance almost immediately and
 * then settles. That front-loading is what makes an entrance feel responsive
 * rather than sluggish at the same nominal duration — the element is legible
 * long before the animation technically finishes.
 *
 * `exit` is deliberately the opposite shape and shorter wherever it is used.
 * Something leaving has already served its purpose; the author's attention has
 * moved on and a leisurely fade-out is just an obstruction.
 */
export const EASE = {
  out: [0.16, 1, 0.3, 1],
  inOut: [0.65, 0, 0.35, 1],
  exit: [0.4, 0, 1, 1],
};

/**
 * Travel distances, in pixels.
 *
 * Small on purpose. The movement is meant to communicate "this is new" at the
 * edge of perception; once travel is large enough to consciously watch, it has
 * become a thing that happens *to* the author instead of a hint about what
 * changed. `rise` is the default for content, `slide` for things entering from
 * a definite direction (a drawer, a sidebar item).
 */
export const DISTANCE = {
  rise: 10,
  slide: 20,
};

/**
 * Stagger timing for lists.
 *
 * `step` is the gap between consecutive children. 45ms is enough to read as a
 * cascade rather than a single block appearing, and short enough that a
 * twenty-row table finishes in well under a second.
 *
 * `maxStep` is not used by the primitives directly — it is the reminder that
 * stagger has to be capped somewhere. `Stagger` handles this by shrinking the
 * step as the child count grows; see the note in Stagger.jsx.
 */
export const STAGGER = {
  step: 0.045,
  maxTotal: 0.5,
};

/**
 * Spring preset for interactions that respond to the pointer.
 *
 * Hover and press are the one place a spring beats a duration curve: the
 * author can interrupt them at any moment by moving the pointer away, and a
 * spring resolves an interrupted animation from its current velocity instead
 * of restarting. Stiff and well damped, so there is no visible wobble — this
 * is for interruptibility, not for bounce.
 */
export const SPRING = {
  type: "spring",
  stiffness: 400,
  damping: 30,
  mass: 0.6,
};
