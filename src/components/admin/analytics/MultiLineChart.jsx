"use client";

import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PALETTE, formatMetric, shortDate } from "@/lib/analyticsFormat.mjs";
import EmptyNote from "./EmptyNote";

const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s || "");

// 2–4 items side by side (Compare tab). Labels are dates in calendar mode and
// "Day N" in since-publish mode.
export default function MultiLineChart({ series, entities, kind = "count", height = 300 }) {
  const rows = (series || []).map((point) => ({ label: point.label, ...point.values }));
  if (!rows.some((r) => entities.some((e) => r[e.id] != null))) return <EmptyNote />;

  const tick = (label) => (isDate(label) ? shortDate(label) : label);

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="#EEF0F4" vertical={false} />
          <XAxis dataKey="label" tickFormatter={tick} tick={{ fontSize: 12, fill: "#6B7280" }} tickLine={false} axisLine={false} minTickGap={28} />
          <YAxis tickFormatter={(v) => formatMetric(kind, v)} tick={{ fontSize: 12, fill: "#6B7280" }} tickLine={false} axisLine={false} width={52} />
          <Tooltip labelFormatter={tick} formatter={(v, name) => [formatMetric(kind, v), name]} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {entities.map((e, i) => (
            <Line
              key={e.id}
              type="monotone"
              dataKey={e.id}
              name={e.name}
              stroke={PALETTE[i % PALETTE.length]}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
