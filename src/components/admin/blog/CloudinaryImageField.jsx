"use client";

import { useRef, useState } from "react";
import { Upload, Loader2, Trash2, ImageIcon } from "lucide-react";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";

const FOCUS_OPTIONS = ["center", "top", "bottom", "left", "right"];

// One Cloudinary-backed image, plus the crop correction that used to live as
// per-slug conditionals on the reader page. `focus` maps to object-position and
// `zoom` to a scale factor, so a badly-framed stock photo is fixed here by the
// editor instead of in code.
export default function CloudinaryImageField({
  label,
  hint,
  value,
  onChange,
  // Name to upload under, which becomes the Cloudinary path in the published
  // <img src>. Falls back to the picked file's own name.
  filename,
  showCrop = true,
}) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const image = value || {};

  const patch = (fields) => onChange({ ...image, ...fields });

  const pick = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const { url, publicId } = await uploadToCloudinary(file, { filename });
      patch({ url, publicId });
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
      {hint && <p className="mb-2 text-xs text-gray-500">{hint}</p>}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {/* overflow-hidden is essential: the zoom control scales the <img> with
            a CSS transform, which paints OUTSIDE this box. Without clipping, a
            zoomed image spills over the controls below it and swallows their
            clicks, leaving the field stuck. */}
        <div className="relative flex h-40 items-center justify-center overflow-hidden bg-gray-50">
          {image.url ? (
            // Plain <img>, not next/image: the URL is arbitrary user input and
            // this is a non-indexed admin preview, so the optimizer adds cost
            // and a remotePatterns constraint for no benefit.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image.url}
              alt={image.alt || ""}
              className="h-full w-full object-cover"
              style={{
                objectPosition: image.focus || "center",
                transform: `scale(${image.zoom || 1})`,
              }}
            />
          ) : (
            <div className="flex flex-col items-center gap-1 text-gray-400">
              <ImageIcon size={22} />
              <span className="text-xs">No image yet</span>
            </div>
          )}

          {busy && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70">
              <Loader2 className="animate-spin text-[#37469E]" />
            </div>
          )}
        </div>

        <div className="space-y-2 border-t border-gray-100 p-3">
          <div className="flex gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#37469E] px-3 py-2 text-xs font-semibold text-white hover:bg-[#2C3A85] disabled:opacity-60"
            >
              <Upload size={14} />
              {image.url ? "Replace" : "Upload"}
            </button>
            {image.url && (
              <button
                type="button"
                onClick={() => onChange({})}
                title="Remove image"
                className="rounded-lg border border-gray-200 px-3 py-2 text-gray-400 hover:text-rose-600"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={pick}
            className="hidden"
          />

          <input
            type="text"
            value={image.alt || ""}
            onChange={(e) => patch({ alt: e.target.value })}
            placeholder="Alt text (describe the image)"
            className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs"
          />

          {showCrop && image.url && (
            <div className="flex gap-2">
              <label className="flex-1">
                <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-gray-400">
                  Focus
                </span>
                <select
                  value={image.focus || "center"}
                  onChange={(e) => patch({ focus: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-xs"
                >
                  {FOCUS_OPTIONS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex-1">
                <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-gray-400">
                  Zoom {(image.zoom || 1).toFixed(2)}×
                </span>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.05"
                  value={image.zoom || 1}
                  onChange={(e) => patch({ zoom: Number(e.target.value) })}
                  className="w-full accent-[#37469E]"
                />
              </label>
            </div>
          )}

          {error && <p className="text-xs text-rose-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}
