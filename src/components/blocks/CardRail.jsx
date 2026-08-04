"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ServiceCardTile from "./ServiceCardTile";

// A scroll-snap rail rather than an auto-playing marquee. It looks the same at
// rest, but it is reachable by keyboard and trackpad, it does not need a
// `prefers-reduced-motion` escape hatch, and it never moves a card out from
// under someone mid-read.
//
// The only client component on the public page — the arrows need to know how far
// the rail has scrolled, which is a browser fact.
export default function CardRail({ cards }) {
  const trackRef = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const sync = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 1);
    // The 1px slack absorbs sub-pixel rounding, which otherwise leaves the
    // "next" arrow enabled forever at the far end of the rail.
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    sync();
    const el = trackRef.current;
    if (!el) return undefined;

    // Cards reflow at every breakpoint, so the arrows have to re-evaluate on
    // resize as well as on scroll.
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    return () => observer.disconnect();
  }, [sync]);

  const scrollBy = (direction) => {
    const el = trackRef.current;
    if (!el) return;
    // Page by one viewport of the rail rather than a fixed pixel count, so the
    // step matches however many cards are actually visible.
    el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: "smooth" });
  };

  // Soften whichever edge has content behind it. A mask fades the cards
  // themselves rather than laying a coloured gradient over them, so the effect
  // survives the band changing colour — and it appears only on the side that is
  // actually cut off, which makes it a scroll cue instead of decoration.
  const edge = "72px";
  const maskImage =
    atStart && atEnd
      ? undefined
      : `linear-gradient(to right, transparent 0, #000 ${
          atStart ? "0" : edge
        }, #000 calc(100% - ${atEnd ? "0px" : edge}), transparent 100%)`;

  return (
    <div className="relative">
      {/* The track runs the full page width. Only `pl-*` matches the shared page
          inset, so the first card lines up with the heading above it; the right
          side is held open by the spacer below instead of `pr-*`, because a
          scroll container's trailing padding is unreliable across browsers and
          would let the last card sit flush against the viewport edge. */}
      <div
        ref={trackRef}
        onScroll={sync}
        tabIndex={0}
        role="group"
        aria-label="Scrollable list of services"
        style={{ maskImage, WebkitMaskImage: maskImage }}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2 pl-6 [scrollbar-width:none] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#37469e] sm:pl-12 md:pl-16 lg:pl-24 xl:pl-32 [&::-webkit-scrollbar]:hidden"
      >
        {cards.map((card) => (
          // Fixed widths, not percentages. A percentage of a full-width track
          // would make each card ~600px on a 1920px screen, which stops reading
          // as a rail and starts reading as a broken grid.
          <div
            key={card.id}
            className="w-[280px] shrink-0 snap-start sm:w-[320px] lg:w-[360px]"
          >
            <ServiceCardTile card={card} variant="tile" />
          </div>
        ))}

        <div
          aria-hidden="true"
          className="w-0 shrink-0 sm:w-6 md:w-10 lg:w-[72px] xl:w-[104px]"
        />
      </div>

      <div className="mt-5 flex justify-center gap-3">
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          disabled={atStart}
          aria-label="Previous services"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#37469e] text-[#37469e] transition-colors hover:bg-[#37469e] hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#37469e]"
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => scrollBy(1)}
          disabled={atEnd}
          aria-label="Next services"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#37469e] text-[#37469e] transition-colors hover:bg-[#37469e] hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#37469e]"
        >
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
