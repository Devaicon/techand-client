"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

// Where an inline body image gets its alt text.
//
// Opened twice over an image's life: once automatically right after it is
// uploaded, and again whenever the author clicks it in the editor.
//
// The distinction this dialog exists to capture is empty-vs-missing alt, which
// are NOT the same thing to a screen reader. `alt=""` says "this is decoration,
// skip it"; no alt attribute at all makes the reader fall back to announcing the
// file name, which for a Cloudinary URL is a string of gibberish. So "decorative"
// is a deliberate choice the author makes here, not the default they get by
// closing the dialog.
//
// The caller mounts this per image (keyed on the image), so `initialAlt` only
// ever has to seed state once — there is no reset-on-prop-change to handle.
export default function ImageAltDialog({ src, initialAlt, onSave, onCancel }) {
  // `initialAlt` is a string when the image already carries an alt attribute and
  // null when it carries none — an empty string therefore means "already marked
  // decorative", which is why the checkbox seeds off `=== ""`.
  const [alt, setAlt] = useState(initialAlt || "");
  const [decorative, setDecorative] = useState(initialAlt === "");
  const inputRef = useRef(null);

  useEffect(() => {
    if (!decorative) inputRef.current?.focus();
  }, [decorative]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);

  const trimmed = alt.trim();
  // Saving is blocked on an empty description precisely so the author has to
  // pick: write one, or tick decorative. Closing the dialog is still an out.
  const canSave = decorative || trimmed.length > 0;

  const submit = (e) => {
    e.preventDefault();
    if (!canSave) return;
    onSave(decorative ? "" : trimmed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5">
          <h2 className="text-sm font-semibold text-gray-900">Describe this image</h2>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4 p-5">
          {src && (
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
              {/* Plain <img>, not next/image: the URL is arbitrary user input on
                  a non-indexed admin screen. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="max-h-40 w-full object-contain" />
            </div>
          )}

          <div>
            <label
              htmlFor="image-alt"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Alt text
            </label>
            <textarea
              id="image-alt"
              ref={inputRef}
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              disabled={decorative}
              rows={3}
              maxLength={250}
              placeholder="Dashboard showing agent runs grouped by outcome"
              className="w-full resize-y rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#37469E] focus:outline-none disabled:bg-gray-50 disabled:text-gray-400"
            />
            <p className="mt-1 text-xs text-gray-500">
              What the image shows, for readers using a screen reader and for
              search engines. Skip &ldquo;image of&rdquo; &mdash; describe the content.
            </p>
          </div>

          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={decorative}
              onChange={(e) => setDecorative(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#37469E] focus:ring-[#37469E]"
            />
            <span className="text-sm text-gray-700">
              Decorative &mdash; no alt text needed
              <span className="block text-xs text-gray-500">
                For images that add nothing the surrounding text does not already
                say. Screen readers will skip it.
              </span>
            </span>
          </label>
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-3.5">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSave}
            className="rounded-lg bg-[#37469E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2C3A85] disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
