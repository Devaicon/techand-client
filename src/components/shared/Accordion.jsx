"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

/**
 * Accordion — a generic, reusable disclosure list.
 *
 * Domain-agnostic on purpose: it knows nothing about blogs or FAQs. Callers
 * pass an `items` array of `{ id, title, content }` and get an accessible
 * expand/collapse list back.
 *
 * @param {Object} props
 * @param {Array<{id?: string, title: React.ReactNode, content: React.ReactNode}>} props.items
 * @param {boolean} [props.singleOpen=true] - When true, opening a panel closes
 *   the previously open one. When false, panels toggle independently.
 * @param {number} [props.defaultOpen=-1] - Index open on first render; -1 for
 *   all collapsed.
 * @param {string} [props.className] - Extra classes on the outer wrapper.
 */
export default function Accordion({
  items = [],
  singleOpen = true,
  defaultOpen = -1,
  className = "",
}) {
  // Single-open tracks one index; multi-open tracks a set of open indices.
  const [openIndex, setOpenIndex] = useState(defaultOpen);
  const [openSet, setOpenSet] = useState(() =>
    defaultOpen >= 0 ? new Set([defaultOpen]) : new Set(),
  );

  if (items.length === 0) return null;

  const isOpen = (i) => (singleOpen ? openIndex === i : openSet.has(i));

  const toggle = (i) => {
    if (singleOpen) {
      setOpenIndex((cur) => (cur === i ? -1 : i));
      return;
    }
    setOpenSet((cur) => {
      const next = new Set(cur);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  return (
    <div className={`divide-y divide-gray-200 overflow-hidden rounded-2xl border border-gray-200 ${className}`}>
      {items.map((item, i) => {
        const open = isOpen(i);
        const panelId = `accordion-panel-${item.id ?? i}`;
        const buttonId = `accordion-button-${item.id ?? i}`;
        return (
          <div key={item.id ?? i}>
            <h3 className="m-0">
              <button
                type="button"
                id={buttonId}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => toggle(i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-[#F7F8FD] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#37469E] sm:px-6"
              >
                <span className="text-base font-semibold text-gray-900">
                  {item.title}
                </span>
                <ChevronDown
                  size={20}
                  aria-hidden="true"
                  className={`shrink-0 text-[#37469E] transition-transform duration-200 ${
                    open ? "rotate-180" : ""
                  }`}
                />
              </button>
            </h3>

            {/* Grid rows 0fr→1fr animate the height open/closed with no
                content measurement; the inner overflow-hidden clips during the
                collapse. `inert` drops the closed panel out of tab order and
                the accessibility tree. */}
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              inert={!open}
              className={`grid transition-all duration-300 ease-out ${
                open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="px-5 pb-5 text-[15px] leading-relaxed text-gray-600 sm:px-6">
                  {typeof item.content === "string" ? (
                    <p className="m-0 whitespace-pre-line">{item.content}</p>
                  ) : (
                    item.content
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
