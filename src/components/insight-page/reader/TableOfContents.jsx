"use client";

import { useEffect, useState } from "react";
import { List, ChevronDown } from "lucide-react";

// Sticky contents rail with scroll-spy.
//
// Uses IntersectionObserver rather than a scroll listener: the browser does the
// work off the main thread, so highlighting stays smooth on long articles.
// The rootMargin pins the "active" band near the top of the viewport, which is
// where a reader's eye actually is — without it, the heading only highlights
// once it has scrolled past the middle of the screen.
export default function TableOfContents({ entries }) {
  const [activeId, setActiveId] = useState(null);
  const [open, setOpen] = useState(false);

  const visible = (entries || []).filter((e) => !e.hidden);

  useEffect(() => {
    if (visible.length === 0) return;

    const observer = new IntersectionObserver(
      (records) => {
        const onScreen = records
          .filter((r) => r.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (onScreen.length > 0) setActiveId(onScreen[0].target.id);
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 },
    );

    const nodes = visible
      .map((e) => document.getElementById(e.id))
      .filter(Boolean);
    nodes.forEach((n) => observer.observe(n));

    return () => observer.disconnect();
  }, [visible.length]); // eslint-disable-line react-hooks/exhaustive-deps

  if (visible.length === 0) return null;

  const links = (
    <ul className="space-y-1">
      {visible.map((entry) => {
        const active = activeId === entry.id;
        return (
          <li key={entry.id} style={{ paddingLeft: `${(entry.level - 2) * 12}px` }}>
            <a
              href={`#${entry.id}`}
              onClick={() => setOpen(false)}
              aria-current={active ? "location" : undefined}
              className={`block border-l-2 py-1.5 pl-3 text-sm leading-snug transition-colors ${
                active
                  ? "border-[#37469E] font-semibold text-[#37469E]"
                  : "border-gray-200 text-gray-600 hover:border-gray-400 hover:text-gray-900"
              }`}
            >
              {entry.label || entry.text}
            </a>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      {/* Mobile / tablet: collapsible, in the normal flow above the article. */}
      <div className="mb-8 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-left"
        >
          <span className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <List size={16} className="text-[#37469E]" /> On this page
          </span>
          <ChevronDown
            size={16}
            className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
        {open && (
          <nav className="mt-2 rounded-xl border border-gray-200 p-3">{links}</nav>
        )}
      </div>

      {/* Desktop: sticky rail. */}
      <nav
        aria-label="Table of contents"
        className="sticky lg:top-36 hidden max-h-[calc(100vh-9rem)] overflow-y-auto lg:block"
      >
        <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
          <List size={14} /> On this page
        </p>
        {links}
      </nav>
    </>
  );
}
