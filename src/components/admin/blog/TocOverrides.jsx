"use client";

import { Eye, EyeOff, RefreshCw } from "lucide-react";

// The TOC itself is derived server-side from the article's headings, so this
// panel never lets you add or reorder entries — that would let the contents
// drift out of sync with the body. It only lets you rename an entry or hide it
// from the rail, both of which are safe because the heading stays put.
export default function TocOverrides({ value = [], onChange, onRefresh, dirty }) {
  const update = (id, fields) =>
    onChange(value.map((t) => (t.id === id ? { ...t, ...fields } : t)));

  if (value.length === 0) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-gray-500">
          No headings detected yet. Add H2 or H3 headings to the article and
          save — the contents rail builds itself from them.
        </p>
        {dirty && (
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 hover:border-[#37469E] hover:text-[#37469E]"
          >
            <RefreshCw size={14} /> Detect headings
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          Derived from the article headings. Rename or hide entries — the
          headings themselves are unaffected.
        </p>
        <button
          type="button"
          onClick={onRefresh}
          title="Re-detect headings from the current article body"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-gray-500 hover:text-[#37469E]"
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {value.map((entry) => (
        <div
          key={entry.id}
          className={`flex items-center gap-2 rounded-lg border border-gray-200 p-2 ${
            entry.hidden ? "opacity-50" : ""
          }`}
          style={{ marginLeft: `${(entry.level - 2) * 16}px` }}
        >
          <span className="w-7 shrink-0 text-center text-[11px] font-semibold text-gray-400">
            H{entry.level}
          </span>
          <input
            type="text"
            value={entry.label || ""}
            onChange={(e) => update(entry.id, { label: e.target.value })}
            placeholder={entry.text}
            className="min-w-0 flex-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm"
          />
          <button
            type="button"
            onClick={() => update(entry.id, { hidden: !entry.hidden })}
            title={entry.hidden ? "Show in contents" : "Hide from contents"}
            className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            {entry.hidden ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      ))}
    </div>
  );
}
