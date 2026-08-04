"use client";

import { useId, useMemo, useRef, useState } from "react";
import { Loader2, Trash2, Upload } from "lucide-react";
import { ICON_REGISTRY, searchIcons } from "@/lib/iconRegistry";
import {
  uploadToCloudinary,
  ACCEPTED_ICON_TYPES,
} from "@/lib/uploadToCloudinary";

// A service's icon comes from one of two places and `kind` records which, so
// switching modes does not destroy the other choice — an author can flip to an
// upload, dislike it, and flip back without re-picking their library icon.
export default function IconField({ value, onChange, label = "Icon", hint }) {
  const icon = value || {};
  const kind = icon.kind || "lucide";

  // Radios group by `name` across the whole document, so a fixed name made
  // every icon field on the page one group: checking Library in one silently
  // unchecked it everywhere else. Each field gets its own group.
  const groupName = `icon-kind-${useId()}`;
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const matches = useMemo(() => searchIcons(query), [query]);

  const patch = (fields) => onChange({ ...icon, ...fields });

  const pick = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const { url, publicId } = await uploadToCloudinary(file, {
        accept: ACCEPTED_ICON_TYPES,
      });
      patch({ kind: "image", url, publicId });
    } catch (err) {
      setError(err.message || "Upload failed.");
    } finally {
      setBusy(false);
      // Clear the input so re-picking the same file still fires onChange.
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
      </label>
      {hint && <p className="mb-1.5 text-xs text-gray-500">{hint}</p>}

      <div className="mb-2 flex gap-4">
        {[
          ["lucide", "Library"],
          ["image", "Upload"],
        ].map(([mode, label]) => (
          <label
            key={mode}
            className="flex cursor-pointer items-center gap-1.5 text-sm text-gray-700"
          >
            <input
              type="radio"
              name={groupName}
              checked={kind === mode}
              onChange={() => patch({ kind: mode })}
              className="accent-[#37469E]"
            />
            {label}
          </label>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-3">
        {kind === "lucide" ? (
          <>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search icons — e.g. cloud, chart, shield"
              className="mb-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />

            <div className="grid max-h-52 grid-cols-6 gap-1.5 overflow-y-auto sm:grid-cols-8">
              {matches.map((name) => {
                const Glyph = ICON_REGISTRY[name];
                const selected = icon.name === name;
                return (
                  <button
                    key={name}
                    type="button"
                    title={name}
                    aria-label={name}
                    aria-pressed={selected}
                    onClick={() => patch({ kind: "lucide", name })}
                    className={`flex aspect-square items-center justify-center rounded-lg border transition-colors ${
                      selected
                        ? "border-[#37469E] bg-[#EEF0FA] text-[#37469E]"
                        : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <Glyph size={18} />
                  </button>
                );
              })}

              {matches.length === 0 && (
                <p className="col-span-full py-4 text-center text-xs text-gray-500">
                  No icon matches “{query}”.
                </p>
              )}
            </div>

            {icon.name && (
              <p className="mt-2 text-xs text-gray-500">
                Selected: <span className="font-medium">{icon.name}</span>
              </p>
            )}
          </>
        ) : (
          <>
            <div className="mb-2 flex h-24 items-center justify-center rounded-lg bg-gray-50">
              {icon.url ? (
                // Plain <img>, not next/image: the URL is arbitrary user input
                // and this is a non-indexed admin preview.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={icon.url}
                  alt={icon.alt || ""}
                  className="max-h-full max-w-full object-contain p-3"
                />
              ) : (
                <span className="text-xs text-gray-400">No icon uploaded</span>
              )}
              {busy && <Loader2 className="animate-spin text-[#37469E]" />}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => inputRef.current?.click()}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#37469E] px-3 py-2 text-xs font-semibold text-white hover:bg-[#2C3A85] disabled:opacity-60"
              >
                <Upload size={14} />
                {icon.url ? "Replace" : "Upload"}
              </button>
              {icon.url && (
                <button
                  type="button"
                  onClick={() => patch({ url: "", publicId: "" })}
                  title="Remove uploaded icon"
                  className="rounded-lg border border-gray-200 px-3 py-2 text-gray-400 hover:text-rose-600"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED_ICON_TYPES.join(",")}
              onChange={pick}
              className="hidden"
            />

            <p className="mt-2 text-xs text-gray-500">
              SVG is best for icons — it stays sharp at every card size.
            </p>
          </>
        )}

        <input
          type="text"
          value={icon.alt || ""}
          onChange={(e) => patch({ alt: e.target.value })}
          placeholder="Icon alt text (for screen readers)"
          className="mt-2 w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs"
        />

        {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
      </div>
    </div>
  );
}
