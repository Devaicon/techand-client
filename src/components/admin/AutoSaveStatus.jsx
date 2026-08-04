"use client";

import { AlertCircle, Check, Loader2 } from "lucide-react";

/**
 * The two halves of an auto-saving form's chrome: the toggle that governs it,
 * and the line that says where the editor has got to.
 *
 * They are separate components because they belong in different places. The
 * toggle is one decision for the whole editor and lives in the toolbar; the
 * status belongs beside the fields it describes, so an author looking at a
 * block's settings can see that block save.
 */

const STATUS = {
  saving: { label: "Saving…", className: "text-gray-400" },
  dirty: { label: "Unsaved changes", className: "text-amber-600" },
  saved: { label: "Saved", className: "text-gray-400" },
  error: { label: "Save failed", className: "text-rose-600" },
};

export function AutoSaveToggle({ enabled, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label="Auto-save"
        onClick={() => onChange(!enabled)}
        title={
          enabled
            ? "Auto-save is on — changes save as you make them"
            : "Auto-save is off — use the Save buttons"
        }
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
          enabled ? "bg-[#37469E]" : "bg-gray-300"
        }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
            enabled ? "translate-x-5" : "translate-x-1"
          }`}
        />
      </button>
      <span className="hidden text-xs font-medium text-gray-600 sm:inline">
        Auto-save
      </span>
    </div>
  );
}

export default function AutoSaveStatus({ status, className = "" }) {
  // "idle" is a form nobody has touched yet, and there is nothing useful to say
  // about it. Rendering the row anyway — rather than nothing — keeps whatever
  // sits beside it from shifting sideways the first time the author types.
  const state = STATUS[status];

  return (
    <span
      aria-live="polite"
      className={`inline-flex min-h-[1.25rem] items-center gap-1 text-xs ${
        state?.className || "text-gray-400"
      } ${className}`}
    >
      {status === "saving" && <Loader2 size={12} className="animate-spin" />}
      {status === "saved" && <Check size={12} className="text-emerald-500" />}
      {status === "error" && <AlertCircle size={12} />}
      {state?.label}
    </span>
  );
}
