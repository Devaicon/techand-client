"use client";

import { useState } from "react";
import useAnalytics from "../useAnalytics";
import { GLOSSARY } from "../glossary";
import Panel from "../Panel";
import MultiLineChart from "../MultiLineChart";
import DataTable from "../DataTable";
import ChangeBadge from "../ChangeBadge";
import EmptyNote from "../EmptyNote";
import { ErrorNote } from "../TabState";
import { formatNumber, formatPosition, shortDate } from "@/lib/analyticsFormat.mjs";

const KINDS = [
  { value: "post", label: "Posts" },
  { value: "page", label: "Pages" },
  { value: "category", label: "Categories" },
  { value: "author", label: "Authors" },
];
const MAX = 4;

const optionsFor = (kind, entities) => {
  if (!entities) return [];
  if (kind === "post") return entities.posts.map((p) => ({ id: p.id, label: p.title }));
  if (kind === "page") return entities.pages.map((p) => ({ id: p.path, label: p.title || p.path }));
  if (kind === "category") return entities.categories.map((c) => ({ id: c, label: c }));
  return entities.authors.map((a) => ({ id: a, label: a }));
};

const totalsColumns = [
  { key: "name", label: "Compared", sortValue: (r) => r.name, render: (r) => <span className="font-medium text-gray-900">{r.name}</span> },
  { key: "users", label: "Visitors", align: "right", sortValue: (r) => r.totals.users, render: (r) => formatNumber(r.totals.users) },
  { key: "clicks", label: "Google clicks", align: "right", sortValue: (r) => r.totals.clicks, render: (r) => formatNumber(r.totals.clicks) },
  { key: "leads", label: "Leads", align: "right", sortValue: (r) => r.totals.leads, render: (r) => formatNumber(r.totals.leads) },
  { key: "rank", label: "Rank", align: "right", sortValue: (r) => (r.totals.avgPosition == null ? null : -r.totals.avgPosition), render: (r) => formatPosition(r.totals.avgPosition) },
];

function SideBySide({ range, refreshKey }) {
  const [kind, setKind] = useState("post");
  const [selected, setSelected] = useState([]);
  const [align, setAlign] = useState("calendar");
  const [filter, setFilter] = useState("");

  const entities = useAnalytics("entities", {}, { refreshKey });
  const ready = selected.length >= 2;
  const compare = useAnalytics(
    "compare",
    { ...range, kind, ids: selected.join(","), align },
    { enabled: ready, refreshKey },
  );

  const options = optionsFor(kind, entities.data).filter((o) => o.label.toLowerCase().includes(filter.toLowerCase()));
  const toggle = (id) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length < MAX ? [...s, id] : s));

  return (
    <Panel title="Side by side">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex rounded-lg bg-gray-100 p-1">
          {KINDS.map((k) => (
            <button
              key={k.value}
              type="button"
              aria-pressed={kind === k.value}
              onClick={() => {
                setKind(k.value);
                setSelected([]);
              }}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${kind === k.value ? "bg-white text-[#37469E] shadow-sm" : "text-gray-600"}`}
            >
              {k.label}
            </button>
          ))}
        </div>
        {kind === "post" && (
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" checked={align === "publish"} onChange={(e) => setAlign(e.target.checked ? "publish" : "calendar")} className="accent-[#37469E]" />
            Line posts up by publish date
          </label>
        )}
      </div>

      {entities.error && <ErrorNote message={entities.error} />}

      <input
        type="search"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter…"
        className="mb-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm sm:w-72"
      />
      <div className="mb-5 flex max-h-44 flex-wrap gap-2 overflow-y-auto">
        {options.map((o) => {
          const on = selected.includes(o.id);
          return (
            <button
              key={o.id}
              type="button"
              aria-pressed={on}
              disabled={!on && selected.length >= MAX}
              onClick={() => toggle(o.id)}
              className={`max-w-xs truncate rounded-full border px-3 py-1 text-sm ${
                on ? "border-[#37469E] bg-[#EEF0FA] text-[#37469E]" : "border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              }`}
            >
              {o.label}
            </button>
          );
        })}
        {entities.data && options.length === 0 && <span className="text-sm text-gray-500">Nothing to pick.</span>}
      </div>

      {!ready ? (
        <EmptyNote>Pick two to four to compare their visitors.</EmptyNote>
      ) : compare.error ? (
        <ErrorNote message={compare.error} />
      ) : (
        <div className="space-y-4">
          <MultiLineChart series={compare.data?.series} entities={compare.data?.entities || []} />
          <DataTable columns={totalsColumns} rows={compare.data?.entities} rowKey={(r) => r.id} initialSort={{ key: "users", dir: "desc" }} />
        </div>
      )}
    </Panel>
  );
}

const IMPACT = [
  { key: "users", label: "Visitors a day" },
  { key: "clicks", label: "Google clicks a day" },
  { key: "leads", label: "Leads a day" },
];
const perDay = (v) => (v == null ? "—" : v.toFixed(v < 10 ? 1 : 0));

function BeforeAfter({ refreshKey }) {
  const [markerId, setMarkerId] = useState("");
  const markers = useAnalytics("markers", {}, { refreshKey });
  const impact = useAnalytics(`markers/${markerId}/impact`, { window: 28 }, { enabled: Boolean(markerId), refreshKey });
  const list = [...(markers.data?.markers || [])].reverse();

  return (
    <Panel title="Before and after" glossary={GLOSSARY.markers}>
      <select
        value={markerId}
        onChange={(e) => setMarkerId(e.target.value)}
        className="mb-4 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm sm:w-[28rem]"
      >
        <option value="">Choose an event…</option>
        {list.map((m) => (
          <option key={m.id} value={m.id}>
            {shortDate(m.date)} {m.date.slice(0, 4)} · {m.label}
          </option>
        ))}
      </select>

      {!markerId ? (
        <EmptyNote>Pick an event to see the 28 days before it against the 28 days after.</EmptyNote>
      ) : impact.error ? (
        <ErrorNote message={impact.error} />
      ) : impact.data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            {IMPACT.map(({ key, label }) => {
              const m = impact.data.metrics[key];
              return (
                <div key={key} className="rounded-xl bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">{label}</p>
                  <p className="mt-1 text-lg font-semibold tabular-nums text-gray-900">
                    {perDay(m.before.avg)} → {perDay(m.after.avg)}
                  </p>
                  <ChangeBadge change={m.change} />
                </div>
              );
            })}
          </div>
          {!impact.data.metrics.users.complete && (
            <p className="mt-3 text-xs text-gray-500">
              Only {impact.data.metrics.users.after.days} of 28 days have passed since this event, so “after” is the average so far.
            </p>
          )}
          {impact.data.marker.path && (
            <p className="mt-1 text-xs text-gray-500">Measured on {impact.data.marker.path} only.</p>
          )}
        </>
      ) : (
        <div className="h-24 animate-pulse rounded-xl bg-gray-50" />
      )}
    </Panel>
  );
}

export default function CompareTab({ range, refreshKey }) {
  return (
    <div className="space-y-6">
      <SideBySide range={range} refreshKey={refreshKey} />
      <BeforeAfter refreshKey={refreshKey} />
    </div>
  );
}
