"use client";

import {
  CartesianGrid, Line, LineChart, ReferenceArea, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { formatMetric, shortDate } from "@/lib/analyticsFormat.mjs";
import EmptyNote from "./EmptyNote";

const CURRENT = "#37469E";
const COMPARE = "#9CA3AF";
const MARKER = "#8B5CF6";

function TrendTooltip({ active, payload, kind, currentLabel, compareLabel }) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="rounded-lg border border-gray-100 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-semibold text-gray-900">{shortDate(row.date)}</p>
      <p className="flex items-center gap-1.5 text-gray-700">
        <span className="h-2 w-2 rounded-full" style={{ background: CURRENT }} />
        {currentLabel}: <strong className="tabular-nums">{formatMetric(kind, row.value)}</strong>
      </p>
      {row.compareDate && (
        <p className="flex items-center gap-1.5 text-gray-500">
          <span className="h-2 w-2 rounded-full" style={{ background: COMPARE }} />
          {compareLabel} ({shortDate(row.compareDate)}): <strong className="tabular-nums">{formatMetric(kind, row.compareValue)}</strong>
        </p>
      )}
    </div>
  );
}

// This period against the comparison period, day by day. Markers (posts
// published, edits, the owner's own) are dotted verticals; Search Console's
// still-settling last days are shaded.
export default function TrendChart({
  data,
  kind = "count",
  markers = [],
  invert = false,
  provisionalFrom,
  currentLabel = "This period",
  compareLabel = "Previous period",
  height = 260,
}) {
  if (!data?.some((p) => p.value != null || p.compareValue != null)) return <EmptyNote />;

  const dates = new Set(data.map((p) => p.date));
  const last = data[data.length - 1]?.date;
  const shade = provisionalFrom && dates.has(provisionalFrom) ? provisionalFrom : null;

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-4" style={{ background: CURRENT }} /> {currentLabel}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0 w-4 border-t-2 border-dashed" style={{ borderColor: COMPARE }} /> {compareLabel}
        </span>
        {markers.length > 0 && (
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-0 border-l-2 border-dotted" style={{ borderColor: MARKER }} /> Events
          </span>
        )}
        {shade && <span className="rounded bg-gray-100 px-1.5 py-0.5">Shaded days are still being finalised by Google</span>}
      </div>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="#EEF0F4" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={shortDate}
              tick={{ fontSize: 12, fill: "#6B7280" }}
              tickLine={false}
              axisLine={false}
              minTickGap={28}
            />
            <YAxis
              reversed={invert}
              tickFormatter={(v) => formatMetric(kind, v)}
              tick={{ fontSize: 12, fill: "#6B7280" }}
              tickLine={false}
              axisLine={false}
              width={52}
              allowDecimals={kind !== "count"}
              domain={invert ? [1, "auto"] : [0, "auto"]}
            />
            <Tooltip
              content={(props) => (
                <TrendTooltip {...props} kind={kind} currentLabel={currentLabel} compareLabel={compareLabel} />
              )}
            />
            {shade && <ReferenceArea x1={shade} x2={last} fill="#F3F4F6" fillOpacity={0.8} />}
            {markers
              .filter((m) => dates.has(m.date))
              .map((m) => (
                <ReferenceLine key={m.id} x={m.date} stroke={MARKER} strokeDasharray="2 3" ifOverflow="hidden" />
              ))}
            <Line
              type="monotone"
              dataKey="compareValue"
              name={compareLabel}
              stroke={COMPARE}
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="value"
              name={currentLabel}
              stroke={CURRENT}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {markers.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2 text-xs text-gray-600">
          {markers.filter((m) => dates.has(m.date)).slice(0, 8).map((m) => (
            <li key={m.id} className="rounded-full bg-violet-50 px-2.5 py-1 text-violet-700">
              {shortDate(m.date)} · {m.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
