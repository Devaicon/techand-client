"use client";

import useAnalytics from "../useAnalytics";
import { GLOSSARY } from "../glossary";
import Panel from "../Panel";
import BarList from "../BarList";
import DataTable from "../DataTable";
import ChangeBadge from "../ChangeBadge";
import { ErrorNote } from "../TabState";
import { formatDuration, formatNumber, formatPct, formatPosition, shortDate } from "@/lib/analyticsFormat.mjs";

const PageCell = ({ row }) => (
  <a href={row.path} target="_blank" rel="noreferrer" className="block max-w-xs hover:underline">
    <span className="block truncate font-medium text-gray-900">{row.title || row.path}</span>
    {row.title && <span className="block truncate text-xs text-gray-400">{row.path}</span>}
  </a>
);

const visitorsWithChange = {
  key: "users",
  label: "Visitors",
  align: "right",
  render: (r) => (
    <span className="inline-flex items-center gap-2">
      {formatNumber(r.users)} <ChangeBadge change={r.change} />
    </span>
  ),
};

const scorecardColumns = [
  { key: "title", label: "Post", sortValue: (r) => r.title, render: (r) => <PageCell row={r} /> },
  { key: "author", label: "Author", sortValue: (r) => r.author },
  { key: "category", label: "Category", sortValue: (r) => r.category },
  visitorsWithChange,
  { key: "clicks", label: "Google clicks", align: "right", render: (r) => formatNumber(r.clicks) },
  { key: "bestQuery", label: "Best search term", sortable: false, render: (r) => r.bestQuery || "—" },
  { key: "leads", label: "Leads", align: "right", render: (r) => formatNumber(r.leads) },
  { key: "daysLive", label: "Days live", align: "right", render: (r) => formatNumber(r.daysLive) },
];

const decayColumns = [
  { key: "path", label: "Page", sortValue: (r) => r.title || r.path, render: (r) => <PageCell row={r} /> },
  { key: "before", label: "Before", align: "right", render: (r) => formatNumber(r.before) },
  { key: "after", label: "Now", align: "right", render: (r) => formatNumber(r.after) },
  { key: "change", label: "Change", align: "right", sortValue: (r) => r.change?.pct, render: (r) => <ChangeBadge change={r.change} /> },
];

const gemColumns = [
  { key: "path", label: "Page", sortValue: (r) => r.title || r.path, render: (r) => <PageCell row={r} /> },
  { key: "impressions", label: "Seen in Google", align: "right", render: (r) => formatNumber(r.impressions) },
  { key: "ctr", label: "Click rate", align: "right", render: (r) => formatPct(r.ctr, 1) },
  { key: "avgPosition", label: "Rank", align: "right", sortValue: (r) => (r.avgPosition == null ? null : -r.avgPosition), render: (r) => formatPosition(r.avgPosition) },
];

const topPageColumns = [
  { key: "path", label: "Page", sortValue: (r) => r.title || r.path, render: (r) => <PageCell row={r} /> },
  visitorsWithChange,
  { key: "views", label: "Views", align: "right", render: (r) => formatNumber(r.views) },
  { key: "avgEngagementSec", label: "Time on page", align: "right", render: (r) => formatDuration(r.avgEngagementSec) },
  { key: "clicks", label: "Google clicks", align: "right", render: (r) => formatNumber(r.clicks) },
];

const rampColumns = [
  { key: "title", label: "Post", sortValue: (r) => r.title, render: (r) => <PageCell row={r} /> },
  { key: "publishedOn", label: "Published", render: (r) => shortDate(r.publishedOn) },
  { key: "days", label: "Days to 100 visitors", align: "right", render: (r) => (r.beforeCoverage ? "before tracking" : r.days == null ? "not yet" : formatNumber(r.days)) },
];

const board = (rows) =>
  (rows || []).map((r) => ({ key: r.name, label: r.name, sublabel: `${r.posts} post${r.posts === 1 ? "" : "s"}`, value: r.users }));

export default function ContentTab({ range, refreshKey }) {
  const { data, loading, error } = useAnalytics("content", range, { refreshKey });
  if (error) return <ErrorNote message={error} />;
  if (loading && !data) return <div className="h-96 animate-pulse rounded-2xl bg-white shadow-sm" />;

  return (
    <div className="space-y-6">
      <Panel title="Insights posts">
        <DataTable columns={scorecardColumns} rows={data?.scorecards} rowKey={(r) => r.id} initialSort={{ key: "users", dir: "desc" }} emptyText="No published posts yet." />
      </Panel>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Losing traffic" glossary={GLOSSARY.decay}>
          <DataTable columns={decayColumns} rows={data?.decay} rowKey={(r) => r.path} emptyText="No page has lost a meaningful share of its visitors." />
        </Panel>
        <Panel title="Hidden gems" glossary={GLOSSARY.hiddenGems}>
          <DataTable columns={gemColumns} rows={data?.hiddenGems} rowKey={(r) => r.path} initialSort={{ key: "impressions", dir: "desc" }} emptyText="No under-clicked pages right now." />
        </Panel>
        <Panel title="Authors">
          <BarList items={board(data?.leaderboards?.authors)} />
        </Panel>
        <Panel title="Categories">
          <BarList items={board(data?.leaderboards?.categories)} />
        </Panel>
      </div>

      <Panel title="How fast new posts take off" glossary={GLOSSARY.rampUp}>
        <p className="mb-3 text-sm text-gray-600">
          {data?.rampUp?.medianDays != null
            ? `A typical post reaches 100 visitors in ${formatNumber(data.rampUp.medianDays)} days.`
            : "No post has reached 100 visitors yet in the stored history."}
        </p>
        <DataTable columns={rampColumns} rows={data?.rampUp?.posts} rowKey={(r) => r.id} initialSort={{ key: "publishedOn", dir: "desc" }} />
      </Panel>

      <Panel title="Top pages">
        <DataTable columns={topPageColumns} rows={data?.topPages} rowKey={(r) => r.path} initialSort={{ key: "users", dir: "desc" }} />
      </Panel>
    </div>
  );
}
