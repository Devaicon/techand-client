"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import useAnalytics from "./useAnalytics";
import { GLOSSARY } from "./glossary";
import MetricCard from "./MetricCard";
import InsightList from "./InsightList";
import { resolvePreset } from "@/lib/analyticsFormat.mjs";

const KIND = { users: "count", gscClicks: "count", avgPosition: "position", leads: "count" };
const SKELETON = Object.keys(KIND).map((key) => ({ key }));

// The four Monday-morning answers — growing? searched? working? leads? — plus
// the week's to-do list, at the top of the admin home for analytics:read.
export default function OverviewBand() {
  const range = useMemo(() => ({ ...resolvePreset("28d"), compare: "previous" }), []);
  const { data, loading, error } = useAnalytics("overview", range);

  if (error) return <p className="mb-8 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>;

  const empty = data && data.headlines.every((h) => h.value == null);
  if (empty) {
    return (
      <Link
        href="/admin/analytics"
        className="mb-8 flex items-center justify-between gap-4 rounded-2xl border border-dashed border-[#37469E]/30 bg-white p-5 text-sm text-gray-700 hover:bg-[#EEF0FA]"
      >
        <span>
          {data.meta.configured
            ? "Analytics is connected. Figures appear here after the first sync."
            : "Connect Google Analytics and Search Console to see visitors, Google rankings and leads here."}
        </span>
        <ArrowRight size={18} className="shrink-0 text-[#37469E]" />
      </Link>
    );
  }

  return (
    <section className="mb-8">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-gray-900">Last 28 days</h2>
        <Link href="/admin/analytics" className="text-sm font-semibold text-[#37469E] hover:underline">
          Open analytics →
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {(data?.headlines || SKELETON).map((h) => (
          <MetricCard
            key={h.key}
            loading={loading && !data}
            label={h.label}
            value={h.value}
            kind={KIND[h.key]}
            change={h.change}
            series={h.series}
            glossary={GLOSSARY[h.key]}
            pace={data?.targets?.find((t) => t.metric === h.key)}
          />
        ))}
      </div>
      <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h3 className="mb-2 text-base font-semibold text-gray-900">What to look at this week</h3>
        <InsightList items={data?.insights} emptyText={loading ? "Loading…" : "Nothing needs your attention this week."} />
      </div>
    </section>
  );
}
