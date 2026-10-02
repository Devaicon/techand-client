"use client";

import Link from "next/link";
import { formatMetric } from "@/lib/analyticsFormat.mjs";
import EmptyNote from "./EmptyNote";

// Ranked list with a proportional bar behind each row — easier to read than a
// bar chart when the labels are long page titles.
export default function BarList({ items, kind = "count", emptyText }) {
  if (!items?.length) return <EmptyNote>{emptyText}</EmptyNote>;
  const max = Math.max(...items.map((i) => i.value || 0)) || 1;

  return (
    <ul className="space-y-1.5">
      {items.map((item) => {
        const label = (
          <span className="block truncate">
            {item.label}
            {item.sublabel && <span className="ml-1.5 text-xs text-gray-400">{item.sublabel}</span>}
          </span>
        );
        return (
          <li key={item.key} className="relative overflow-hidden rounded-lg">
            <span
              className="absolute inset-y-0 left-0 bg-[#EEF0FA]"
              style={{ width: `${Math.max(2, (item.value / max) * 100)}%` }}
              aria-hidden="true"
            />
            <span className="relative flex items-center gap-3 px-3 py-1.5 text-sm">
              <span className="min-w-0 flex-1 text-gray-800">
                {item.href ? (
                  <Link href={item.href} target="_blank" className="hover:underline">
                    {label}
                  </Link>
                ) : (
                  label
                )}
              </span>
              <span className="tabular-nums font-medium text-gray-900">{formatMetric(kind, item.value)}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
