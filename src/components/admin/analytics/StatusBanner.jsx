"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import adminApi from "@/lib/adminApi";

const POLL_MS = 3000;
const timeFmt = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" });

// Freshness, sync problems, storage warnings, and the "Sync now" button. Polls
// the run it started until it finishes, then tells the page to reload.
export default function StatusBanner({ status, canManage, onSynced }) {
  const [running, setRunning] = useState(null);
  const [error, setError] = useState("");
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const poll = (id) => {
    timer.current = setTimeout(async () => {
      try {
        const { data } = await adminApi.get(`/analytics/sync/${id}`);
        if (data.data.run.status === "running") return poll(id);
        setRunning(null);
        onSynced?.();
      } catch {
        setRunning(null);
      }
    }, POLL_MS);
  };

  const syncNow = async () => {
    setError("");
    try {
      const { data } = await adminApi.post("/analytics/sync");
      const run = data.data.run;
      if (run.status === "running") {
        setRunning(run.id);
        poll(run.id);
      } else {
        onSynced?.();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Could not start a sync.");
    }
  };

  if (!status) return null;
  const last = status.lastRun;
  const problems = last && ["partial", "failed"].includes(last.status) ? last.problems : [];
  const warnings = last?.warnings || [];

  return (
    <div className="mb-6 space-y-3">
      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
        <span>
          {status.lastSuccessAt ? `Updated ${timeFmt.format(new Date(status.lastSuccessAt))}` : "Not synced yet"}
          {" · "}Google search figures run about 3 days behind
        </span>
        {canManage && status.configured && (
          <button
            type="button"
            onClick={syncNow}
            disabled={Boolean(running)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            {running ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
            {running ? "Syncing…" : "Sync now"}
          </button>
        )}
      </div>

      {error && <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}

      {(problems.length > 0 || warnings.length > 0) && (
        <div className="flex gap-2.5 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <div>
            {problems.length > 0 && (
              <p className="font-semibold">
                The last sync {last.status === "failed" ? "failed" : "only partly worked"} — showing the most recent data that did arrive.
              </p>
            )}
            <ul className="mt-1 space-y-0.5">
              {problems.map((p) => <li key={`${p.source}${p.message}`}>{p.message}</li>)}
              {warnings.map((w) => <li key={w}>{w}</li>)}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
