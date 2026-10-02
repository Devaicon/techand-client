"use client";

import useAnalytics from "../useAnalytics";
import { GLOSSARY } from "../glossary";
import MetricCard from "../MetricCard";
import Panel from "../Panel";
import TrendChart from "../TrendChart";
import DonutChart from "../DonutChart";
import BarList from "../BarList";
import DataTable from "../DataTable";
import { ErrorNote, compareLabelFor } from "../TabState";
import { formatNumber, formatPct, shortDate } from "@/lib/analyticsFormat.mjs";

const sourceColumns = [
  {
    key: "path",
    label: "Page the form was on",
    sortValue: (r) => r.title || r.path,
    render: (r) => (
      <a href={r.path} target="_blank" rel="noreferrer" className="hover:underline">
        {r.title || r.path}
      </a>
    ),
  },
  { key: "leads", label: "Leads", align: "right", render: (r) => formatNumber(r.leads) },
  { key: "users", label: "Visitors", align: "right", render: (r) => formatNumber(r.users) },
  { key: "leadRate", label: "Lead rate", align: "right", render: (r) => formatPct(r.leadRate, 1) },
];

const toItems = (slices) => (slices || []).map((s) => ({ key: s.name, label: s.name, value: s.value }));

export default function LeadsTab({ range, refreshKey }) {
  const { data, loading, error } = useAnalytics("leads", range, { refreshKey });
  if (error) return <ErrorNote message={error} />;

  const cards = data?.cards;
  const skeleton = loading && !data;
  const since = data?.meta?.attributionSince;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard loading={skeleton} label="Leads" value={cards?.leads.value} change={cards?.leads} glossary={GLOSSARY.leads} />
        <MetricCard loading={skeleton} label="Call-back requests" value={cards?.callback.value} change={cards?.callback} />
        <MetricCard loading={skeleton} label="Expert enquiries" value={cards?.expert.value} change={cards?.expert} />
        <MetricCard loading={skeleton} label="Lead rate" kind="pct" value={cards?.leadRate.value} change={cards?.leadRate} glossary={GLOSSARY.leadRate} />
      </div>

      {data && (!since || since > range.from) && (
        <p className="rounded-xl bg-gray-50 p-3 text-sm text-gray-600">
          {since
            ? `Where leads came from is recorded from ${shortDate(since)}. Earlier leads count in the totals but have no source.`
            : "Where leads came from is recorded for new submissions only, and none have arrived since that started."}
        </p>
      )}

      <Panel title="Leads over time">
        <TrendChart data={data?.series} compareLabel={compareLabelFor(range)} />
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Which form">
          <DonutChart data={data?.byForm} />
        </Panel>
        <Panel title="Channels that brought leads" glossary={GLOSSARY.channels}>
          <DonutChart data={data?.gaChannels} emptyText="Google Analytics hasn't recorded a lead in this period yet." />
        </Panel>
      </div>

      <Panel title="Pages that produce leads">
        <DataTable columns={sourceColumns} rows={data?.bySourcePage} rowKey={(r) => r.path} initialSort={{ key: "leads", dir: "desc" }} emptyText="No attributed leads in this period." />
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="First page of the visit">
          <BarList items={toItems(data?.byLandingPage)} emptyText="No attributed leads in this period." />
        </Panel>
        <Panel title="Campaign source">
          <BarList items={toItems(data?.byUtmSource)} emptyText="No attributed leads in this period." />
        </Panel>
      </div>
    </div>
  );
}
