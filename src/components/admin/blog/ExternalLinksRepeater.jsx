"use client";

import { Plus, Trash2 } from "lucide-react";
import { normalizeUrl } from "@/lib/normalizeUrl";

// Curated further-reading links, rendered in the reader's right-hand rail.
// Deliberately hand-picked rather than auto-extracted from the body: the rail
// is an editorial recommendation, not a dump of every link in the article.
export default function ExternalLinksRepeater({ value = [], onChange }) {
  const update = (index, fields) =>
    onChange(value.map((l, i) => (i === index ? { ...l, ...fields } : l)));

  const add = () =>
    onChange([...value, { label: "", url: "", description: "" }]);

  const remove = (index) => onChange(value.filter((_, i) => i !== index));

  return (
    <div className="space-y-3">
      {value.length === 0 && (
        <p className="text-sm text-gray-500">
          No external links yet. These appear in the right-hand rail of the
          article.
        </p>
      )}

      {value.map((link, index) => (
        <div
          // Index key is safe here: rows carry no external references (unlike
          // CTAs) and are only ever appended or removed.
          key={index}
          className="rounded-xl border border-gray-200 bg-gray-50/60 p-3"
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Link {index + 1}
            </span>
            <button
              type="button"
              onClick={() => remove(index)}
              title="Remove link"
              className="text-gray-400 hover:text-rose-600"
            >
              <Trash2 size={15} />
            </button>
          </div>

          <div className="space-y-2">
            <input
              type="text"
              value={link.label}
              onChange={(e) => update(index, { label: e.target.value })}
              placeholder="Link title"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
            <input
              type="text"
              value={link.url}
              onChange={(e) => update(index, { url: e.target.value })}
              onBlur={(e) => update(index, { url: normalizeUrl(e.target.value) })}
              placeholder="example.com or https://…"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
            <input
              type="text"
              value={link.description}
              onChange={(e) => update(index, { description: e.target.value })}
              placeholder="One-line description (optional)"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 hover:border-[#37469E] hover:text-[#37469E]"
      >
        <Plus size={15} /> Add link
      </button>
    </div>
  );
}
