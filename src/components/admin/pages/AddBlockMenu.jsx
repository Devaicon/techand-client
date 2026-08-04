"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowDownToLine, ClipboardPaste, Plus, Search, X } from "lucide-react";
import BlockPreview from "./BlockPreview";
import BlockThumbnail from "./BlockThumbnail";
import { blockFieldSummary } from "./blockSampleProps";

/**
 * The block palette, grouped by the category each block declares.
 *
 * Labels, categories, blurbs and previews all derive from the server registry
 * rather than a map maintained here — which is what stops a block added in a
 * later cycle from showing up as a bare `"pricing-table"` with no description
 * until someone remembers to name it on the client too.
 *
 * A dialog rather than a dropdown, for two reasons. It carries a live preview
 * of the highlighted block, which needs more room than a menu has; and the
 * button that opens it lives inside a 380px floating panel with its own scroll
 * container, which would clip a popover of any useful size.
 *
 * Picking is two steps on purpose: highlight to preview, then add. Adding a
 * block changes the page, and the whole point of the preview is to see what
 * that change looks like before making it.
 */
export default function AddBlockMenu({ definitions, onPick, onPaste, clipboard }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeType, setActiveType] = useState(null);
  const searchRef = useRef(null);

  // Category order follows first appearance in the registry, so the server
  // decides the palette's running order too.
  const { grouped, flat } = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const matches = needle
      ? definitions.filter((d) =>
          `${d.label} ${d.blurb} ${d.category}`.toLowerCase().includes(needle),
        )
      : definitions;

    const groups = new Map();
    for (const definition of matches) {
      const key = definition.category || "Blocks";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(definition);
    }
    return { grouped: [...groups.entries()], flat: matches };
  }, [definitions, query]);

  // The highlight follows the list: after a search that excludes it, a stale
  // highlight would preview a block the author can no longer see.
  const active =
    flat.find((d) => d.type === activeType) || flat[0] || null;

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
      event.preventDefault();
      const index = flat.findIndex((d) => d.type === active?.type);
      const next = event.key === "ArrowDown" ? index + 1 : index - 1;
      const target = flat[(next + flat.length) % flat.length];
      if (target) setActiveType(target.type);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, flat, active]);

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  const add = (definition) => {
    onPick(definition);
    close();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          // Focused after the dialog mounts, not with autoFocus, so the
          // scroll position of the page behind it is left alone.
          setTimeout(() => searchRef.current?.focus(), 0);
        }}
        className="inline-flex items-center gap-1.5 rounded-lg bg-[#37469E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2C3A85]"
      >
        <Plus size={16} /> Add block
      </button>

      {/* No mounted flag: `open` is false until the button is clicked, so the
          portal is unreachable during the server render by construction. */}
      {open &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Add a block"
            className="fixed inset-0 z-[120] flex items-center justify-center p-4"
          >
            <button
              type="button"
              aria-label="Close"
              onClick={close}
              className="absolute inset-0 cursor-default bg-gray-900/40"
            />

            <div className="relative flex h-[min(78vh,640px)] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl">
              {/* ── list ──────────────────────────────────────────────── */}
              <div className="flex w-[19rem] shrink-0 flex-col border-r border-gray-200">
                <div className="border-b border-gray-100 p-2">
                  <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-2.5">
                    <Search size={14} className="shrink-0 text-gray-400" />
                    <input
                      ref={searchRef}
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search blocks…"
                      className="w-full bg-transparent py-2 text-sm outline-none"
                    />
                  </div>
                </div>

                {clipboard && (
                  <button
                    type="button"
                    onClick={() => {
                      onPaste();
                      close();
                    }}
                    className="flex w-full items-center gap-2.5 border-b border-gray-100 px-4 py-2.5 text-left hover:bg-gray-50"
                  >
                    <ClipboardPaste size={15} className="shrink-0 text-[#37469E]" />
                    <span className="text-sm font-semibold text-gray-900">
                      Paste {clipboard.label.toLowerCase()}
                    </span>
                  </button>
                )}

                <div className="min-h-0 flex-1 overflow-y-auto">
                  {grouped.length === 0 && (
                    <p className="px-4 py-8 text-center text-sm text-gray-500">
                      No blocks match “{query}”.
                    </p>
                  )}

                  {grouped.map(([category, items]) => (
                    <div key={category}>
                      <p className="sticky top-0 z-10 bg-gray-50 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                        {category}
                      </p>
                      {items.map((definition) => {
                        const selected = definition.type === active?.type;
                        return (
                          <button
                            key={definition.type}
                            type="button"
                            aria-current={selected}
                            onMouseEnter={() => setActiveType(definition.type)}
                            onFocus={() => setActiveType(definition.type)}
                            onClick={() => setActiveType(definition.type)}
                            onDoubleClick={() => add(definition)}
                            className={`flex w-full items-start gap-3 border-l-2 px-3 py-2.5 text-left ${
                              selected
                                ? "border-[#37469E] bg-[#F4F6FD]"
                                : "border-transparent hover:bg-gray-50"
                            }`}
                          >
                            <BlockThumbnail
                              definition={definition}
                              className="mt-0.5 h-10 w-[68px] shrink-0 rounded border border-gray-200"
                            />
                            <span className="min-w-0">
                              <span className="block text-sm font-semibold text-gray-900">
                                {definition.label}
                              </span>
                              <span className="block text-xs leading-5 text-gray-500">
                                {definition.blurb}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* ── preview ───────────────────────────────────────────── */}
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start gap-3 border-b border-gray-100 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                      {active?.category || "Preview"}
                    </p>
                    <h2 className="truncate text-base font-bold text-gray-900">
                      {active?.label || "Pick a block"}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={close}
                    aria-label="Close"
                    className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto bg-gray-50 p-5">
                  {active ? (
                    <>
                      <BlockPreview definition={active} />
                      <p className="mt-4 text-sm leading-6 text-gray-600">
                        {active.blurb}
                      </p>
                      {blockFieldSummary(active) && (
                        <p className="mt-2 text-xs text-gray-500">
                          You will fill in: {blockFieldSummary(active)}.
                        </p>
                      )}
                      <p className="mt-4 text-xs text-gray-400">
                        Preview uses sample content to show the layout. Your own
                        copy and images replace it.
                      </p>
                    </>
                  ) : (
                    <p className="py-16 text-center text-sm text-gray-500">
                      Search or pick a block on the left to preview it.
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 border-t border-gray-100 px-5 py-3">
                  <p className="flex min-w-0 flex-1 items-center gap-1.5 text-xs text-gray-500">
                    <ArrowDownToLine size={14} className="shrink-0 text-gray-400" />
                    Added at the end of the page — drag it into place afterwards.
                  </p>
                  <button
                    type="button"
                    disabled={!active}
                    onClick={() => add(active)}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#37469E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2C3A85] disabled:opacity-50"
                  >
                    <Plus size={15} />
                    Add {active ? active.label.toLowerCase() : "block"}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
