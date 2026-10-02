"use client";

import { useState } from "react";
import { CheckCircle2, Circle, Copy } from "lucide-react";

// Shown until Google is connected and the first sync has landed. Each step
// mirrors one item of the setup guide, ticked from the /status payload.
export default function SetupChecklist({ status }) {
  const [copied, setCopied] = useState(false);
  const hasData = Boolean(status?.coverage?.ga4 || status?.coverage?.gsc);
  const steps = [
    { done: Boolean(status?.serviceAccountEmail), text: "Service-account key added to the server" },
    { done: Boolean(status?.sources?.ga4), text: "Google Analytics (GA4) property connected" },
    { done: Boolean(status?.sources?.gsc), text: "Search Console property connected" },
    { done: hasData, text: "First sync completed — press Sync now; the first one loads up to two years of history" },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(status.serviceAccountEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — the address is still selectable */
    }
  };

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900">Connect Google to see your analytics</h2>
      <p className="mt-1 text-sm text-gray-500">
        The dashboard fills in once the server can read your Google Analytics and Search Console data.
      </p>
      <ol className="mt-5 space-y-3">
        {steps.map((s) => (
          <li key={s.text} className="flex items-center gap-2.5 text-sm">
            {s.done ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Circle size={18} className="text-gray-300" />}
            <span className={s.done ? "text-gray-500 line-through" : "text-gray-800"}>{s.text}</span>
          </li>
        ))}
      </ol>

      {status?.serviceAccountEmail && (
        <div className="mt-5 rounded-xl bg-gray-50 p-4 text-sm">
          <p className="text-gray-600">Give this address read access in GA4 and Search Console:</p>
          <p className="mt-1 flex items-center gap-2 font-mono text-xs text-gray-900">
            <span className="break-all">{status.serviceAccountEmail}</span>
            <button type="button" onClick={copy} className="shrink-0 rounded p-1 text-gray-400 hover:text-gray-700" aria-label="Copy address">
              <Copy size={14} />
            </button>
            {copied && <span className="text-emerald-600">Copied</span>}
          </p>
        </div>
      )}

      {status?.missing?.length > 0 && (
        <div className="mt-5">
          <p className="text-sm font-semibold text-gray-800">Still missing on the server</p>
          <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm text-gray-600">
            {status.missing.map((m) => <li key={m}>{m}</li>)}
          </ul>
        </div>
      )}
    </section>
  );
}
