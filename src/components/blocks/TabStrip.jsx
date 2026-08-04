"use client";

import { Fragment, useEffect, useRef } from "react";
import { ChevronRight } from "lucide-react";

/**
 * The row of tab buttons — one line, always.
 *
 * Extracted from the `tabs` block so the `header-panel` block can mount the same
 * split card without a second copy of the selection chrome. It is presentational:
 * the caller owns `index`/`setActive` and the keyboard handler, so one strip can
 * drive whatever panel sits beside or below it.
 *
 * It scrolls sideways rather than wrapping. Tab labels are author-written and the
 * strip's width is whatever column it lands in, so there is no type size at which
 * every combination fits: four audience labels and their chevrons come to roughly
 * 650px of content, and the split layout's column is 612px at desktop and 460px
 * at `md`. Wrapping is what that overflow used to look like, and a `rounded-full`
 * container with two rows of pills inside it reads as broken. Scrolling is the
 * same thing every mobile tab bar does, and it degrades to nothing at all on the
 * widths where the labels do fit.
 *
 * `w-fit max-w-full` rather than `justify-center` for the centred variant:
 * centring a flex row that overflows its scroll container pushes content off
 * BOTH edges, and the part that goes off the left cannot be scrolled back to.
 * Sizing the container to its content instead means it is only ever centred
 * while it fits.
 */
export default function TabStrip({
  visible,
  index,
  setActive,
  onKeyDown,
  baseId,
  label,
  split,
}) {
  const trackRef = useRef(null);
  const settled = useRef(false);

  // Follow the selection when the arrow keys walk past the visible edge.
  // `nearest` on both axes is a no-op while the tab is already in view, so this
  // never moves anything on a strip that fits — and never scrolls the page
  // itself on first paint, which is what `settled` guards.
  useEffect(() => {
    if (settled.current) {
      trackRef.current
        ?.querySelector('[aria-selected="true"]')
        ?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    }
    settled.current = true;
  }, [index]);

  return (
    <div
      ref={trackRef}
      role="tablist"
      aria-label={label || "Tabs"}
      onKeyDown={onKeyDown}
      // The scrollbar is suppressed on both engines: it is a 15px-tall strip of
      // chrome across the bottom of a pill, and the cut-off tab at the edge is
      // the affordance instead.
      className={`mb-8 flex w-fit max-w-full items-center overflow-x-auto rounded-full border border-gray-100 bg-white p-1.5 shadow-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
        split ? "gap-0.5" : "mx-auto gap-1 sm:gap-2"
      }`}
    >
      {visible.map((tab, i) => {
        const selected = i === index;
        return (
          <Fragment key={tab.id}>
            {/* The design separates the tabs with chevrons rather than spacing.
                Decorative only — the tablist's children that matter are the
                tabs, and a screen reader is told about those by role.

                Held back until `lg`, where the copy column is wide enough to
                spend 42px on separators. Below that they would only push the
                labels further into the scroll region. */}
            {split && i > 0 && (
              <ChevronRight
                aria-hidden="true"
                className="hidden h-3.5 w-3.5 shrink-0 text-[#9aa1b9] lg:block"
              />
            )}
            <button
              id={`${baseId}-tab-${i}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${i}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(i)}
              // `shrink-0` and `whitespace-nowrap`: in a scroll container a flex
              // item will happily compress to nothing and break its own label
              // across lines rather than let the row overflow.
              className={`shrink-0 whitespace-nowrap rounded-full font-semibold transition-colors duration-200 ${
                split
                  ? "px-3 py-1.5 text-[12.5px] lg:px-3.5 lg:py-2 lg:text-[13px]"
                  : "px-3.5 py-2 text-[13px] sm:px-4 sm:text-[14px]"
              } ${
                selected
                  ? "bg-gradient-to-r from-[#4653a2] to-[#683b80] text-white"
                  : "text-[#4a5565] hover:bg-gray-50"
              }`}
            >
              {tab.title}
            </button>
          </Fragment>
        );
      })}
    </div>
  );
}
