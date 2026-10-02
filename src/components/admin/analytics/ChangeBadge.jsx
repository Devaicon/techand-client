"use client";

import { describeChange } from "@/lib/analyticsFormat.mjs";

const TONE = {
  good: "bg-emerald-50 text-emerald-700",
  bad: "bg-rose-50 text-rose-700",
  neutral: "bg-gray-100 text-gray-500",
};

export default function ChangeBadge({ change, kind = "count" }) {
  const { text, tone } = describeChange(change, { kind });
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${TONE[tone]}`}>
      {text}
    </span>
  );
}
