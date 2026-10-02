"use client";

import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import adminApi from "@/lib/adminApi";
import { useToast } from "@/components/admin/Toast";
import useAnalytics from "../useAnalytics";
import { GLOSSARY } from "../glossary";
import Panel from "../Panel";
import MetricCard from "../MetricCard";
import EmptyNote from "../EmptyNote";
import { ErrorNote } from "../TabState";
import { addDays, formatPct, monthLabel, resolvePreset, shortDate } from "@/lib/analyticsFormat.mjs";

const METRICS = [
  { key: "users", label: "Visitors", kind: "count", hint: "people" },
  { key: "gscClicks", label: "Google clicks", kind: "count", hint: "clicks" },
  { key: "leads", label: "Leads", kind: "count", hint: "forms submitted" },
  { key: "avgPosition", label: "Average Google rank", kind: "position", hint: "or better (lower)" },
];

// Keyed by month + saved values in the parent, so a load or a save remounts it
// with fresh inputs instead of syncing state in an effect.
function TargetsForm({ month, initial, canManage, onSaved }) {
  const toast = useToast();
  const [values, setValues] = useState(() =>
    Object.fromEntries(METRICS.map((m) => [m.key, initial.find((t) => t.metric === m.key)?.value ?? ""])),
  );
  const [saving, setSaving] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.put("/analytics/targets", {
        month,
        targets: METRICS.map((m) => ({ metric: m.key, value: values[m.key] === "" ? null : Number(values[m.key]) })),
      });
      toast.success(`Targets for ${monthLabel(month)} saved.`);
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save the targets.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {METRICS.map((m) => (
        <label key={m.key} className="block">
          <span className="mb-1.5 block text-sm font-medium text-gray-700">{m.label}</span>
          <input
            type="number"
            min="0"
            step={m.kind === "position" ? "0.1" : "1"}
            value={values[m.key]}
            disabled={!canManage}
            onChange={(e) => setValues((v) => ({ ...v, [m.key]: e.target.value }))}
            placeholder="No target"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm disabled:bg-gray-50"
          />
          <span className="mt-1 block text-xs text-gray-400">{m.hint}</span>
        </label>
      ))}
      {canManage && (
        <div className="sm:col-span-2 xl:col-span-4">
          <button type="submit" disabled={saving} className="inline-flex items-center gap-1.5 rounded-lg bg-[#37469E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2C3A85] disabled:opacity-60">
            {saving && <Loader2 size={15} className="animate-spin" />} Save targets
          </button>
          <span className="ml-3 text-xs text-gray-500">Leave a box empty to remove that target.</span>
        </div>
      )}
    </form>
  );
}

function Targets({ canManage, refreshKey }) {
  const thisMonth = resolvePreset("this-month").from.slice(0, 7);
  const nextMonth = addDays(`${thisMonth}-28`, 7).slice(0, 7);
  const [month, setMonth] = useState(thisMonth);
  const [saved, setSaved] = useState(0);
  const { data, error } = useAnalytics("targets", { month }, { refreshKey: `${refreshKey}|${saved}` });

  return (
    <Panel
      title="Monthly targets"
      action={
        <select value={month} onChange={(e) => setMonth(e.target.value)} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm">
          {[thisMonth, nextMonth].map((m) => (
            <option key={m} value={m}>{monthLabel(m)}</option>
          ))}
        </select>
      }
    >
      {error && <ErrorNote message={error} />}
      {data && (
        <>
          <TargetsForm
            key={`${month}|${JSON.stringify(data.targets)}`}
            month={month}
            initial={data.targets}
            canManage={canManage}
            onSaved={() => setSaved((n) => n + 1)}
          />
          {data.paces.length > 0 && (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {data.paces.map((p) => {
                const m = METRICS.find((x) => x.key === p.metric);
                return <MetricCard key={p.metric} label={`${m.label} so far`} value={p.actual} kind={m.kind} pace={p} />;
              })}
            </div>
          )}
        </>
      )}
    </Panel>
  );
}

function Markers({ canManage, refreshKey }) {
  const toast = useToast();
  const [version, setVersion] = useState(0);
  const [showAuto, setShowAuto] = useState(false);
  const [form, setForm] = useState({ date: resolvePreset("7d").to, label: "", path: "" });
  const [busy, setBusy] = useState(false);
  const { data, error } = useAnalytics("markers", {}, { refreshKey: `${refreshKey}|${version}` });

  const list = [...(data?.markers || [])].reverse().filter((m) => showAuto || m.kind === "manual");

  const add = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await adminApi.post("/analytics/markers", form);
      setForm((f) => ({ ...f, label: "", path: "" }));
      setVersion((n) => n + 1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not add the marker.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (marker) => {
    if (!confirm(`Delete the marker "${marker.label}"?`)) return;
    try {
      await adminApi.delete(`/analytics/markers/${marker.id}`);
      setVersion((n) => n + 1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not delete the marker.");
    }
  };

  return (
    <Panel title="Markers" glossary={GLOSSARY.markers}>
      {canManage && (
        <form onSubmit={add} className="mb-5 grid gap-3 sm:grid-cols-[10rem_1fr_1fr_auto]">
          <input type="date" required value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className="rounded-lg border border-gray-200 px-3 py-2 text-sm" />
          <input required maxLength={120} value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} placeholder="What happened, e.g. SEO fixes shipped" className="rounded-lg border border-gray-200 px-3 py-2 text-sm" />
          <input value={form.path} onChange={(e) => setForm((f) => ({ ...f, path: e.target.value }))} placeholder="Page it concerns (optional), e.g. /contact-us" className="rounded-lg border border-gray-200 px-3 py-2 text-sm" />
          <button type="submit" disabled={busy} className="rounded-lg bg-[#37469E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2C3A85] disabled:opacity-60">
            Add
          </button>
        </form>
      )}

      <label className="mb-3 flex items-center gap-2 text-sm text-gray-600">
        <input type="checkbox" checked={showAuto} onChange={(e) => setShowAuto(e.target.checked)} className="accent-[#37469E]" />
        Also show posts published and edited
      </label>

      {error && <ErrorNote message={error} />}
      {data && list.length === 0 ? (
        <EmptyNote>No markers yet. Add one when you ship a change you want to measure.</EmptyNote>
      ) : (
        <ul className="divide-y divide-gray-50">
          {list.map((m) => (
            <li key={m.id} className="flex items-center gap-3 py-2 text-sm">
              <span className="w-24 shrink-0 tabular-nums text-gray-500">{shortDate(m.date)} {m.date.slice(0, 4)}</span>
              <span className="min-w-0 flex-1 truncate text-gray-800">
                {m.label}
                {m.path && <span className="ml-1.5 text-xs text-gray-400">{m.path}</span>}
              </span>
              {canManage && m.kind === "manual" && (
                <button type="button" onClick={() => remove(m)} title="Delete" className="text-gray-400 hover:text-rose-600">
                  <Trash2 size={15} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

function DataStatus({ status }) {
  const pct = status?.storage?.pct;
  return (
    <Panel title="Your data">
      <dl className="grid gap-4 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-gray-500">Google Analytics history</dt>
          <dd className="font-medium text-gray-900">
            {status?.coverage?.ga4 ? `${shortDate(status.coverage.ga4.from)} ${status.coverage.ga4.from.slice(0, 4)} – ${shortDate(status.coverage.ga4.to)}` : "None yet"}
          </dd>
        </div>
        <div>
          <dt className="text-gray-500">Search Console history</dt>
          <dd className="font-medium text-gray-900">
            {status?.coverage?.gsc ? `${shortDate(status.coverage.gsc.from)} ${status.coverage.gsc.from.slice(0, 4)} – ${shortDate(status.coverage.gsc.to)}` : "None yet"}
          </dd>
        </div>
        <div>
          <dt className="text-gray-500">Database space used</dt>
          <dd className="font-medium text-gray-900">{pct == null ? "—" : `${formatPct(pct)} of 512 MB`}</dd>
          {pct != null && (
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-gray-100">
              <div className={`h-full ${pct >= 0.8 ? "bg-amber-500" : "bg-[#37469E]"}`} style={{ width: `${Math.min(100, Math.round(pct * 100))}%` }} />
            </div>
          )}
        </div>
      </dl>
    </Panel>
  );
}

export default function GoalsTab({ canManage, refreshKey, status }) {
  return (
    <div className="space-y-6">
      <Targets canManage={canManage} refreshKey={refreshKey} />
      <Markers canManage={canManage} refreshKey={refreshKey} />
      <DataStatus status={status} />
    </div>
  );
}
