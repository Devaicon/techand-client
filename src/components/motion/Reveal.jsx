"use client";

import { motion } from "motion/react";
import { useEntrance } from "./entrance";

/**
 * Fades a single element in when it appears.
 *
 * This is the workhorse of the module — one region of a page, a card, a
 * heading block, a panel body. For anything that is a *list* of sibling
 * elements, reach for `Stagger` instead; wrapping each row in its own `Reveal`
 * gives every row the same delay and they all land at once, which is the exact
 * effect stagger exists to avoid.
 *
 *   <Reveal>                       fade + a small rise, the default
 *   <Reveal variant="fade">        opacity only, for things that must not move
 *   <Reveal delay={0.1}>           to sequence two or three unrelated regions
 *   <Reveal as="section">          renders a <section> rather than a <div>
 *
 * ## It animates on mount, which is the point
 *
 * Almost every admin page renders empty, fetches, then renders content. That
 * second render mounts the content subtree, so a mount-triggered entrance
 * lands exactly when the data arrives with no loading state to wire up. Where
 * the container itself never unmounts — a table whose rows are replaced by a
 * filter, say — pass a `key` that changes with the data to force the entrance
 * to run again.
 */
export default function Reveal({
  as = "div",
  variant = "rise",
  delay = 0,
  duration,
  // Scroll-triggered mode. Unused in the admin panel, where pages are short and
  // content arrives asynchronously rather than scrolling into view — but this
  // is the same vocabulary the public site will want, and having it here means
  // that work is a prop rather than a second system.
  inView = false,
  once = true,
  amount = 0.2,
  className,
  children,
  ...rest
}) {
  const { hidden, shown, transition } = useEntrance(variant, { duration, delay });
  const Component = motion[as] ?? motion.div;

  const trigger = inView
    ? { whileInView: shown, viewport: { once, amount } }
    : { animate: shown };

  return (
    <Component
      initial={hidden}
      {...trigger}
      transition={transition}
      className={className}
      {...rest}
    >
      {children}
    </Component>
  );
}
