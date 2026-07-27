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

  return (
    <div className="relative">
      <div
        ref={trackRef}
        onScroll={sync}
        tabIndex={0}
        role="group"
        aria-label="Scrollable list of services"
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#37469e] [&::-webkit-scrollbar]:hidden"
      >
        {cards.map((card) => (
          <div
            key={card.id}
            className="w-[85%] shrink-0 snap-start sm:w-[46%] lg:w-[31%]"
          >
            <ServiceCardTile card={card} variant="tile" />
          </div>
        ))}
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
