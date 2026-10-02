"use client";

import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { formatMetric } from "@/lib/analyticsFormat.mjs";
import ChangeBadge from "./ChangeBadge";
import GlossaryTip from "./GlossaryTip";

const PACE = {
  ahead: { label: "Ahead of target", bar: "bg-emerald-500", text: "text-emerald-700" },
  "on-track": { label: "On track", bar: "bg-[#37469E]", text: "text-[#37469E]" },
  behind: { label: "Behind target", bar: "bg-amber-500", text: "text-amber-700" },
  "no-data": { label: "Not enough data yet", bar: "bg-gray-300", text: "text-gray-500" },
};

// One figure, its change against the comparison period, a sparkline of the
// period, and — when a monthly target exists — how the month is pacing.
export default function MetricCard({ label, value, kind = "count", change, glossary, series, pace, loading }) {
  if (loading) {
    return <div className="h-[148px] animate-pulse rounded-2xl border border-gray-100 bg-white shadow-sm" />;
  }

  const paceStyle = pace ? PACE[pace.status] || PACE["no-data"] : null;
  const progress =
    pace && pace.projected != null && pace.target
      ? kind === "position"
        ? Math.min(1, pace.target / pace.projected)
        : Math.min(1, pace.projected / pace.target)
      : 0;

  return (
    <div className="flex min-w-0 flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <p className="flex items-center gap-1.5 text-sm font-medium text-gray-500">
        {label}
        <GlossaryTip text={glossary} />
      </p>
      <div className="mt-2 flex flex-wrap items-baseline gap-2">
        <span className="text-3xl font-bold tabular-nums text-gray-900">{formatMetric(kind, value)}</span>
        {change && <ChangeBadge change={change} kind={kind} />}
      </div>

      {series?.some((p) => p.value != null) && (
        <div className="mt-3 h-10" aria-hidden="true">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 2, right: 0, bottom: 2, left: 0 }}>
              <Area
                type="monotone"
                dataKey="value"
                stroke="#37469E"
                strokeWidth={1.5}
                fill="#EEF0FA"
                isAnimationActive={false}
                connectNulls={false}
                baseValue={kind === "position" ? "dataMax" : 0}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {paceStyle && (
        <div className="mt-3">
          <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
            <div className={`h-full ${paceStyle.bar}`} style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
          <p className={`mt-1.5 text-xs font-medium ${paceStyle.text}`}>
            {paceStyle.label}
            {pace.projected != null &&
              (kind === "position"
                ? ` · ${formatMetric(kind, pace.projected)} vs target ${formatMetric(kind, pace.target)}`
                : ` · on course for ${formatMetric(kind, pace.projected)} of ${formatMetric(kind, pace.target)}`)}
          </p>
        </div>
      )}
    </div>
  );
}
