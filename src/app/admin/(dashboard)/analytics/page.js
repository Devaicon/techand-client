"use client";

import { Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAdminAuth } from "../../AdminAuthProvider";
import { RANGE_PRESETS, resolvePreset } from "@/lib/analyticsFormat.mjs";
import useAnalytics from "@/components/admin/analytics/useAnalytics";
import RangePicker from "@/components/admin/analytics/RangePicker";
import SetupChecklist from "@/components/admin/analytics/SetupChecklist";
import StatusBanner from "@/components/admin/analytics/StatusBanner";
import { ErrorNote } from "@/components/admin/analytics/TabState";
import TrafficTab from "@/components/admin/analytics/tabs/TrafficTab";
import SearchTab from "@/components/admin/analytics/tabs/SearchTab";
import ContentTab from "@/components/admin/analytics/tabs/ContentTab";
import LeadsTab from "@/components/admin/analytics/tabs/LeadsTab";
import CompareTab from "@/components/admin/analytics/tabs/CompareTab";
import GoalsTab from "@/components/admin/analytics/tabs/GoalsTab";

// Indexed by property access, inline — the React Compiler's static-components
// rule rejects a component resolved through a helper call during render.
const TAB_COMPONENTS = {
  traffic: TrafficTab,
  content: ContentTab,
  search: SearchTab,
  leads: LeadsTab,
  compare: CompareTab,
  goals: GoalsTab,
};

const TABS = [
  { key: "traffic", label: "Traffic" },
  { key: "content", label: "Content" },
  { key: "search", label: "Search" },
  { key: "leads", label: "Leads" },
  { key: "compare", label: "Compare" },
  { key: "goals", label: "Goals & markers" },
];

// Tabs that ignore the date range hide the picker.
const UNRANGED = new Set(["goals"]);

function Spinner() {
  return (
    <div className="flex justify-center py-20">
      <Loader2 className="animate-spin text-[#37469E]" />
    </div>
  );
}

function Analytics() {
  const { can } = useAdminAuth();
  const router = useRouter();
  const params = useSearchParams();

  const tab = TAB_COMPONENTS[params.get("tab")] ? params.get("tab") : "traffic";
  const preset = RANGE_PRESETS.some((p) => p.value === params.get("range")) ? params.get("range") : "28d";
  const compare = params.get("compare") === "year" ? "year" : "previous";
  const range = useMemo(() => ({ ...resolvePreset(preset), compare }), [preset, compare]);

  const allowed = can("analytics:read");
  const status = useAnalytics("status", {}, { enabled: allowed });

  // Tab, range and comparison live in the URL so a view can be bookmarked or
  // sent to someone.
  const update = (next) => {
    const q = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(next)) q.set(key, value);
    router.replace(`/admin/analytics?${q.toString()}`, { scroll: false });
  };

  if (!allowed) {
    return (
      <p className="rounded-xl bg-white p-6 text-sm text-gray-600 shadow-sm">
        You don&apos;t have access to Analytics. An admin can grant it from the Users page.
      </p>
    );
  }

  const s = status.data;
  const hasData = Boolean(s?.coverage?.ga4 || s?.coverage?.gsc);
  const ActiveTab = TAB_COMPONENTS[tab];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">Visitors, Google search and leads, in plain numbers.</p>
        </div>
        {hasData && !UNRANGED.has(tab) && (
          <RangePicker
            preset={preset}
            compare={compare}
            onChange={(next) => update({ ...(next.preset ? { range: next.preset } : {}), ...(next.compare ? { compare: next.compare } : {}) })}
          />
        )}
      </div>

      {status.loading && !s ? (
        <Spinner />
      ) : status.error ? (
        <ErrorNote message={status.error} />
      ) : (
        <>
          <StatusBanner status={s} canManage={can("analytics:manage")} onSynced={status.reload} />
          {!hasData ? (
            <SetupChecklist status={s} />
          ) : (
            <>
              <nav role="tablist" aria-label="Analytics sections" className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-gray-100 bg-white p-1 shadow-sm">
                {TABS.map((t) => (
                  <button
                    key={t.key}
                    role="tab"
                    type="button"
                    aria-selected={tab === t.key}
                    onClick={() => update({ tab: t.key })}
                    className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                      tab === t.key ? "bg-[#37469E] text-white" : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </nav>
              <ActiveTab range={range} refreshKey={s.lastSuccessAt || ""} canManage={can("analytics:manage")} status={s} />
            </>
          )}
        </>
      )}
    </div>
  );
}

// useSearchParams needs a Suspense boundary above it.
export default function AnalyticsPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <Analytics />
    </Suspense>
  );
}
