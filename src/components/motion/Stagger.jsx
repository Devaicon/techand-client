"use client";

import { Children } from "react";
import { motion, stagger } from "motion/react";
import { useEntrance } from "./entrance";
import { STAGGER } from "./tokens";

/**
 * Fades a list of siblings in one after another.
 *
 *   <Stagger className="grid gap-6">
 *     {rows.map((row) => (
 *       <StaggerItem key={row.id}>…</StaggerItem>
 *     ))}
 *   </Stagger>
 *
 * ## Why this is a pair of components and not a prop on `Reveal`
 *
 * The delay each child needs depends on its index, and only the parent knows
 * that. Motion solves this with variants: the parent declares the schedule,
 * every child declares the same two state *names*, and Motion walks the tree
 * handing out delays. The children therefore carry no timing of their own —
 * which is what lets a caller reorder, filter, or paginate the list without
 * anything recomputing delays by hand.
 *
 * The consequence to know about: `StaggerItem` must not be given its own
 * `initial` or `animate`. Those override the inherited variant and the child
 * silently drops out of the cascade, landing on its own instead. It is the one
 * sharp edge in this module.
 *
 * ## Re-running after data changes
 *
 * The cascade runs when `Stagger` mounts. A container that stays mounted while
 * its children are swapped — a table under a filter — will not replay it. Give
 * `Stagger` a `key` derived from the query when you want the list to re-enter.
 */
export default function Stagger({
  as = "div",
  step = STAGGER.step,
  delay = 0,
  className,
  children,
  ...rest
}) {
  // Long lists get a proportionally tighter step. At a fixed 45ms a
  // forty-row table would take almost two seconds to finish arriving, and the
  // last rows would land well after the author had started reading the first —
  // the cascade stops being a hint and becomes something being waited on.
  // Capping the *total* keeps short lists relaxed and long lists brisk.
  const count = Children.count(children);
  const effectiveStep =
    count > 1 ? Math.min(step, STAGGER.maxTotal / count) : 0;

  const Component = motion[as] ?? motion.div;

  return (
    <Component
      initial="hidden"
      animate="shown"
      variants={{
        // Empty, but required: a variant the parent does not define is not
        // propagated to children at all.
        hidden: {},
        shown: {
          transition: {
            // `stagger()` rather than the older `staggerChildren` number,
            // which Motion deprecated in v12 in favour of this.
            delayChildren: stagger(effectiveStep, { startDelay: delay }),
          },
        },
      }}
      className={className}
      {...rest}
    >
      {children}
    </Component>
  );
}

/**
 * One child of a `Stagger`. Takes the same `variant` vocabulary as `Reveal`.
 */
export function StaggerItem({
  as = "div",
  variant = "rise",
  duration,
  className,
  children,
  ...rest
}) {
  const { hidden, shown, transition } = useEntrance(variant, { duration });
  const Component = motion[as] ?? motion.div;

  return (
    <Component
      // Deliberately no `initial` / `animate` — see the note above. The names
      // here must match the ones the parent declares.
      variants={{ hidden, shown: { ...shown, transition } }}
      className={className}
      {...rest}
    >
      {children}
    </Component>
  );
}
