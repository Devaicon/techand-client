"use client";

import useAnalytics from "../useAnalytics";
import { GLOSSARY } from "../glossary";
import MetricCard from "../MetricCard";
import Panel from "../Panel";
import TrendChart from "../TrendChart";
import DonutChart from "../DonutChart";
import BarList from "../BarList";
import { ErrorNote, compareLabelFor } from "../TabState";

const DEVICE = { desktop: "Desktop", mobile: "Mobile", tablet: "Tablet" };

export default function TrafficTab({ range, refreshKey }) {
  const { data, loading, error } = useAnalytics("traffic", range, { refreshKey });
  if (error) return <ErrorNote message={error} />;

  const cards = data?.cards;
  const skeleton = loading && !data;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard loading={skeleton} label="Visitors" value={cards?.users.value} change={cards?.users} glossary={GLOSSARY.users} />
        <MetricCard loading={skeleton} label="Visits" value={cards?.sessions.value} change={cards?.sessions} glossary={GLOSSARY.sessions} />
        <MetricCard loading={skeleton} label="Pages viewed" value={cards?.views.value} change={cards?.views} glossary={GLOSSARY.views} />
        <MetricCard loading={skeleton} label="Engaged visits" kind="pct" value={cards?.engagementRate.value} change={cards?.engagementRate} glossary={GLOSSARY.engagementRate} />
      </div>

      <Panel title="Visitors over time" glossary={GLOSSARY.markers}>
        <TrendChart data={data?.series} markers={data?.markers} compareLabel={compareLabelFor(range)} />
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Where visitors come from" glossary={GLOSSARY.channels}>
          <DonutChart data={data?.channels} />
        </Panel>
        <Panel title="Devices">
          <DonutChart data={(data?.devices || []).map((d) => ({ ...d, name: DEVICE[d.name] || d.name }))} />
        </Panel>
        <Panel title="New and returning visitors">
          <DonutChart data={data?.newVsReturning} />
        </Panel>
        <Panel title="Top countries">
          <BarList items={(data?.countries || []).map((c) => ({ key: c.name, label: c.name, value: c.value }))} />
        </Panel>
        <Panel title="Top sources" className="lg:col-span-2">
          <BarList items={(data?.sources || []).map((s) => ({ key: s.name, label: s.name, value: s.value }))} />
        </Panel>
      </div>
    </div>
  );
}
