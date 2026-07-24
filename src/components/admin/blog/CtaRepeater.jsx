"use client";

import { Plus, Trash2, CornerDownLeft } from "lucide-react";
import { normalizeUrl } from "@/lib/normalizeUrl";

// Placement decides where the reader renders each CTA:
//   inline  — at a marker the author drops into the body
//   end     — stacked after the article
//   sidebar — in the right rail, under the external links
const PLACEMENTS = [
  { value: "end", label: "End of article" },
  { value: "inline", label: "Inline (in the body)" },
  { value: "sidebar", label: "Right sidebar" },
];

// Stable, collision-resistant key. Inline CTAs are referenced from the body by
// this key, so it must never be an array index — reordering the list would
// silently repoint every marker.
const newKey = () =>
  `cta-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export default function CtaRepeater({ value = [], onChange, onInsertMarker }) {
  const update = (index, fields) =>
    onChange(value.map((c, i) => (i === index ? { ...c, ...fields } : c)));

  const add = () =>
    onChange([
      ...value,
      {
        key: newKey(),
        title: "",
        description: "",
        buttonLabel: "Get in touch",
        href: "/contact-us",
        placement: "end",
      },
    ]);

  const remove = (index) => onChange(value.filter((_, i) => i !== index));

  return (
    <div className="space-y-3">
      {value.length === 0 && (
        <p className="text-sm text-gray-500">
          No calls to action yet. Add one to invite readers to act.
        </p>
      )}

      {value.map((cta, index) => (
        <div
          key={cta.key}
          className="rounded-xl border border-gray-200 bg-gray-50/60 p-3"
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              CTA {index + 1}
            </span>
            <button
              type="button"
              onClick={() => remove(index)}
              title="Remove CTA"
              className="text-gray-400 hover:text-rose-600"
            >
              <Trash2 size={15} />
            </button>
          </div>

          <div className="space-y-2">
            <input
              type="text"
              value={cta.title}
              onChange={(e) => update(index, { title: e.target.value })}
              placeholder="Heading — e.g. Book a discovery session"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
            <textarea
              value={cta.description}
              onChange={(e) => update(index, { description: e.target.value })}
              placeholder="Supporting line (optional)"
              rows={2}
              className="w-full resize-y rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={cta.buttonLabel}
                onChange={(e) => update(index, { buttonLabel: e.target.value })}
                placeholder="Button label"
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
              <input
                type="text"
                value={cta.href}
                onChange={(e) => update(index, { href: e.target.value })}
                onBlur={(e) => update(index, { href: normalizeUrl(e.target.value) })}
                placeholder="/contact-us or example.com"
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={cta.placement}
                onChange={(e) => update(index, { placement: e.target.value })}
                className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"
              >
                {PLACEMENTS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>

              {cta.placement === "inline" && (
                <button
                  type="button"
                  onClick={() => onInsertMarker?.(cta.key)}
                  title="Drop this CTA at the cursor position in the article"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#37469E] px-3 py-2 text-xs font-semibold text-[#37469E] hover:bg-[#EEF0FA]"
                >
                  <CornerDownLeft size={14} />
                  Place at cursor
                </button>
              )}
            </div>

            {cta.placement === "inline" && (
              <p className="text-xs text-gray-500">
                Put your cursor where you want this CTA in the article, then
                click <strong>Place at cursor</strong>. A marker appears in the
                body; the CTA renders there. Markers for deleted CTAs are
                cleaned up automatically when you save.
              </p>
            )}
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 hover:border-[#37469E] hover:text-[#37469E]"
      >
        <Plus size={15} /> Add CTA
      </button>
    </div>
  );
}
