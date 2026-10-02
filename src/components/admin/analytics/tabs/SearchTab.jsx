"use client";

import useAnalytics from "../useAnalytics";
import { GLOSSARY } from "../glossary";
import MetricCard from "../MetricCard";
import Panel from "../Panel";
import TrendChart from "../TrendChart";
import DonutChart from "../DonutChart";
import BarList from "../BarList";
import DataTable from "../DataTable";
import ChangeBadge from "../ChangeBadge";
import { ErrorNote, compareLabelFor } from "../TabState";
import { formatNumber, formatPct, formatPosition, shortDate } from "@/lib/analyticsFormat.mjs";

const PageLink = ({ path }) =>
  path ? (
    <a href={path} target="_blank" rel="noreferrer" className="text-[#37469E] hover:underline">
      {path}
    </a>
  ) : (
    "—"
  );

// Rank sorts best-first when "descending": smaller positions are better.
const rankSort = (r) => (r.avgPosition == null ? null : -r.avgPosition);

const keywordColumns = [
  {
    key: "query",
    label: "Search term",
    sortValue: (r) => r.query,
    render: (r) => (
      <span className="font-medium text-gray-900">
        {r.query}
        {r.isNew && <span className="ml-1.5 rounded bg-[#EEF0FA] px-1.5 py-0.5 text-xs text-[#37469E]">new</span>}
      </span>
    ),
  },
  {
    key: "clicks",
    label: "Clicks",
    align: "right",
    render: (r) => (
      <span className="inline-flex items-center gap-2">
        {formatNumber(r.clicks)} <ChangeBadge change={r.clicksChange} />
      </span>
    ),
  },
  { key: "impressions", label: "Seen", align: "right", render: (r) => formatNumber(r.impressions) },
  { key: "ctr", label: "Click rate", align: "right", render: (r) => formatPct(r.ctr, 1) },
  {
    key: "avgPosition",
    label: "Rank",
    align: "right",
    sortValue: rankSort,
    render: (r) => (
      <span className="inline-flex items-center gap-2">
        {formatPosition(r.avgPosition)} <ChangeBadge change={r.positionChange} kind="position" />
      </span>
    ),
  },
  { key: "topPage", label: "Page", sortable: false, render: (r) => <PageLink path={r.topPage} /> },
];

const almostColumns = [
  { key: "query", label: "Search term", sortValue: (r) => r.query, render: (r) => <span className="font-medium text-gray-900">{r.query}</span> },
  { key: "avgPosition", label: "Rank", align: "right", sortValue: rankSort, render: (r) => formatPosition(r.avgPosition) },
  { key: "impressions", label: "Seen", align: "right", render: (r) => formatNumber(r.impressions) },
  { key: "topPage", label: "Page to improve", sortable: false, render: (r) => <PageLink path={r.topPage} /> },
];

export default function SearchTab({ range, refreshKey }) {
  const { data, loading, error } = useAnalytics("search", range, { refreshKey });
  if (error) return <ErrorNote message={error} />;

  const cards = data?.cards;
  const skeleton = loading && !data;
  const compareLabel = compareLabelFor(range);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard loading={skeleton} label="Google clicks" value={cards?.clicks.value} change={cards?.clicks} glossary={GLOSSARY.gscClicks} />
        <MetricCard loading={skeleton} label="Times seen in Google" value={cards?.impressions.value} change={cards?.impressions} glossary={GLOSSARY.impressions} />
        <MetricCard loading={skeleton} label="Click rate" kind="pct" value={cards?.ctr.value} change={cards?.ctr} glossary={GLOSSARY.ctr} />
        <MetricCard loading={skeleton} label="Average Google rank" kind="position" value={cards?.avgPosition.value} change={cards?.avgPosition} glossary={GLOSSARY.avgPosition} />
      </div>

      {data?.meta?.keywordGranularity === "monthly" && (
        <p className="rounded-xl bg-gray-50 p-3 text-sm text-gray-600">
          Part of this range is older than 90 days, so its keyword figures are monthly totals.
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Google clicks over time" glossary={GLOSSARY.gscClicks}>
          <TrendChart data={data?.clicksSeries} provisionalFrom={data?.meta?.provisionalFrom} compareLabel={compareLabel} />
        </Panel>
        <Panel title="Average Google rank over time" glossary={GLOSSARY.avgPosition}>
          <TrendChart data={data?.positionSeries} kind="position" invert provisionalFrom={data?.meta?.provisionalFrom} compareLabel={compareLabel} />
        </Panel>
      </div>

      <Panel title="Top search terms">
        <DataTable columns={keywordColumns} rows={data?.topKeywords} rowKey={(r) => r.query} initialSort={{ key: "clicks", dir: "desc" }} maxRows={15} />
      </Panel>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Almost on page 1" glossary={GLOSSARY.almostPageOne}>
          <DataTable
            columns={almostColumns}
            rows={data?.almostPageOne}
            rowKey={(r) => r.query}
            emptyText="No search terms are sitting just off page 1 right now."
          />
        </Panel>
        <Panel title="Searching by name vs by topic" glossary={GLOSSARY.branded}>
          <DonutChart data={data?.branded} />
        </Panel>
      </div>

      <Panel title="Pages that win Google clicks">
        <BarList
          items={(data?.topPages || []).map((p) => ({
            key: p.path,
            label: p.title || p.path,
            sublabel: p.title ? p.path : undefined,
            value: p.clicks,
            href: p.path,
          }))}
        />
      </Panel>

      {data?.meta?.provisionalFrom && (
        <p className="text-xs text-gray-400">Figures from {shortDate(data.meta.provisionalFrom)} onwards are still being finalised by Google.</p>
      )}
    </div>
  );
}
