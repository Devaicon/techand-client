"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { PALETTE, formatMetric, formatPct, withShare } from "@/lib/analyticsFormat.mjs";
import EmptyNote from "./EmptyNote";

// A donut with its legend beside it, carrying the numbers. The legend does the
// reading; the ring only gives the proportions at a glance.
export default function DonutChart({ data, kind = "count", emptyText }) {
  const slices = withShare((data || []).filter((d) => d.value > 0));
  if (!slices.length) return <EmptyNote>{emptyText}</EmptyNote>;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="h-40 w-40 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              dataKey="value"
              nameKey="name"
              innerRadius="62%"
              outerRadius="100%"
              paddingAngle={slices.length > 1 ? 1.5 : 0}
              stroke="none"
              isAnimationActive={false}
            >
              {slices.map((s, i) => (
                <Cell key={s.name} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v, name) => [formatMetric(kind, v), name]} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="w-full min-w-0 space-y-1.5 text-sm">
        {slices.map((s, i) => (
          <li key={s.name} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: PALETTE[i % PALETTE.length] }} />
            <span className="min-w-0 flex-1 truncate text-gray-700">{s.name}</span>
            <span className="tabular-nums text-gray-900">{formatMetric(kind, s.value)}</span>
            <span className="w-10 text-right tabular-nums text-gray-400">{formatPct(s.share)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
