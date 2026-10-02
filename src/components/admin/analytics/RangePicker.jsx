"use client";

import { RANGE_PRESETS } from "@/lib/analyticsFormat.mjs";

export default function RangePicker({ preset, compare, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="sr-only" htmlFor="analytics-range">Date range</label>
      <select
        id="analytics-range"
        value={preset}
        onChange={(e) => onChange({ preset: e.target.value })}
        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700"
      >
        {RANGE_PRESETS.map((p) => (
          <option key={p.value} value={p.value}>{p.label}</option>
        ))}
      </select>
      <div className="flex rounded-lg bg-gray-100 p-1" role="group" aria-label="Compare with">
        {[
          { value: "previous", label: "vs previous period" },
          { value: "year", label: "vs last year" },
        ].map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={compare === o.value}
            onClick={() => onChange({ compare: o.value })}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              compare === o.value ? "bg-white text-[#37469E] shadow-sm" : "text-gray-600"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
