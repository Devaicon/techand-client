"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import EmptyNote from "./EmptyNote";

// Sortable table. Columns declare how to render a cell and what to sort by;
// numbers sort descending first, because "biggest first" is what people want.
export default function DataTable({ columns, rows, rowKey, initialSort, emptyText, maxRows = 10 }) {
  const [sort, setSort] = useState(initialSort || null);
  const [expanded, setExpanded] = useState(false);

  if (!rows?.length) return <EmptyNote>{emptyText}</EmptyNote>;

  const column = columns.find((c) => c.key === sort?.key);
  const sorted = column
    ? [...rows].sort((a, b) => {
        const get = column.sortValue || ((r) => r[column.key]);
        const x = get(a);
        const y = get(b);
        if (x == null && y == null) return 0;
        if (x == null) return 1;
        if (y == null) return -1;
        const order = typeof x === "string" ? x.localeCompare(y) : x - y;
        return sort.dir === "asc" ? order : -order;
      })
    : rows;
  const visible = expanded ? sorted : sorted.slice(0, maxRows);

  const toggle = (c) => {
    if (c.sortable === false) return;
    setSort((s) => (s?.key === c.key ? { key: c.key, dir: s.dir === "desc" ? "asc" : "desc" } : { key: c.key, dir: "desc" }));
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              {columns.map((c) => (
                <th key={c.key} className={`whitespace-nowrap px-3 py-2 ${c.align === "right" ? "text-right" : ""}`}>
                  {c.sortable === false ? (
                    c.label
                  ) : (
                    <button type="button" onClick={() => toggle(c)} className="inline-flex items-center gap-1 hover:text-gray-800">
                      {c.label}
                      {sort?.key === c.key && (sort.dir === "desc" ? <ArrowDown size={12} /> : <ArrowUp size={12} />)}
                    </button>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {visible.map((row) => (
              <tr key={rowKey(row)} className="hover:bg-gray-50/60">
                {columns.map((c) => (
                  <td key={c.key} className={`px-3 py-2 align-top ${c.align === "right" ? "text-right tabular-nums" : ""}`}>
                    {c.render ? c.render(row) : row[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sorted.length > maxRows && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="mt-2 text-sm font-semibold text-[#37469E] hover:underline"
        >
          {expanded ? "Show fewer" : `Show all ${sorted.length}`}
        </button>
      )}
    </div>
  );
}
