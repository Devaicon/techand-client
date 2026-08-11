"use client";

import { useRef, useState } from "react";
import {
  AlertTriangle,
  FileJson,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import adminApi from "@/lib/adminApi";
import { useOverlayMotion } from "@/components/motion";
import {
  importPage,
  parsePageExport,
  splitByKnownType,
} from "@/lib/pageTransfer.mjs";

/**
 * Import a page from a `.page.json` file, as a new draft page.
 *
 * Two steps rather than one: pick the file, then confirm what is about to be
 * created. The confirm step is where this earns its keep — it is the only place
 * an author can be told that four of the file's blocks are types this install
 * does not have, while they can still decide not to import it. Discovering that
 * afterwards, on a page that already exists, is a worse position to be in.
 *
 * Always creates a new page and never touches an existing one, so there is no
 * destructive path to guard. A page that came from this install and is being
 * imported back arrives beside the original, not over it.
 */
export default function ImportPageDialog({ existingSlugs, onImported, onClose }) {
  const inputRef = useRef(null);

  // null until a file parses. Then: the file's contents plus the editable
  // title/slug the new page will be created with.
  const [staged, setStaged] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);

  const backdrop = useOverlayMotion("backdrop");
  const dialog = useOverlayMotion("modal");

  const taken = new Set(existingSlugs || []);

  // A file exported from this install would otherwise collide on its own slug
  // and come back as "A page already uses that URL." after the author had
  // already pressed Import. Suffixed up front instead, and left editable.
  const freeSlug = (slug) => {
    if (!slug || !taken.has(slug)) return slug;
    let candidate = `${slug}-copy`;
    let n = 2;
    while (taken.has(candidate)) candidate = `${slug}-copy-${n++}`;
    return candidate;
  };

  const readFile = async (file) => {
    setError("");
    setStaged(null);

    if (!file) return;

    try {
      const parsed = parsePageExport(await file.text());

      // The catalog is fetched now rather than when the dialog opens: it is only
      // needed once there is a block list to check against it.
      const { data } = await adminApi.get("/blocks");
      const { supported, unsupported } = splitByKnownType(
        parsed.sections,
        data.data.blocks,
      );

      setStaged({
        fileName: file.name,
        page: parsed.page,
        supported,
        unsupported,
        title: parsed.page.title || "",
        slug: freeSlug(parsed.page.slug || ""),
      });
    } catch (err) {
      setError(
        err.message ||
          err.response?.data?.message ||
          "Could not read that file.",
      );
    }
  };

  const onDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    readFile(event.dataTransfer.files?.[0]);
  };

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await importPage(adminApi, {
        page: { ...staged.page, title: staged.title, slug: staged.slug },
        sections: staged.supported,
      });
      onImported(result);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to import that page.",
      );
      setBusy(false);
    }
  };

  const skipped = staged?.unsupported.length || 0;

  return (
    // The backdrop fades on its own track; the dialog rises and scales inside
    // it. Separating the two is what stops the panel appearing to be painted on
    // the dim sheet and arriving as one flat rectangle.
    <motion.div
      {...backdrop}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    >
      <motion.div
        {...dialog}
        className="max-h-full w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">Import a page</h2>
            <p className="mt-0.5 text-xs leading-5 text-gray-500">
              Creates a new draft page from a <code>.page.json</code> export.
              Nothing existing is changed.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </header>

        <form onSubmit={submit} className="space-y-4 p-5">
          {error && (
            <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
              {error}
            </p>
          )}

          {!staged ? (
            <>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                className={`flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors ${
                  dragging
                    ? "border-[#37469E] bg-[#EEF0FA]"
                    : "border-gray-300 hover:border-[#37469E] hover:bg-gray-50"
                }`}
              >
                <FileJson size={26} className="text-[#37469E]" />
                <span className="text-sm font-semibold text-gray-900">
                  Choose a file, or drop one here
                </span>
                <span className="text-xs text-gray-500">
                  The <code>.page.json</code> file a page editor&rsquo;s Export
                  button writes
                </span>
              </button>

              <input
                ref={inputRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={(e) => readFile(e.target.files?.[0])}
              />
            </>
          ) : (
            <>
              <p className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
                <FileJson size={14} className="shrink-0 text-gray-400" />
                <span className="truncate">{staged.fileName}</span>
                <button
                  type="button"
                  onClick={() => setStaged(null)}
                  className="ml-auto shrink-0 font-semibold text-[#37469E] hover:underline"
                >
                  Change
                </button>
              </p>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-gray-700">
                  Title
                </span>
                <input
                  type="text"
                  value={staged.title}
                  onChange={(e) =>
                    setStaged((s) => ({ ...s, title: e.target.value }))
                  }
                  required
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-gray-700">
                  URL
                </span>
                <div className="flex items-center rounded-lg border border-gray-200 px-3">
                  <span className="text-sm text-gray-400">/</span>
                  <input
                    type="text"
                    value={staged.slug}
                    onChange={(e) =>
                      setStaged((s) => ({ ...s, slug: e.target.value }))
                    }
                    required
                    className="w-full py-2 pl-0.5 text-sm outline-none"
                  />
                </div>
                {staged.slug !== staged.page.slug && (
                  <span className="mt-1 block text-xs text-amber-600">
                    A page already uses /{staged.page.slug}, so this one gets a
                    different URL.
                  </span>
                )}
              </label>

              <p className="text-sm text-gray-600">
                <strong>{staged.supported.length}</strong> block
                {staged.supported.length === 1 ? "" : "s"} will be added, in the
                order they appear in the file.
              </p>

              {skipped > 0 && (
                <div className="flex gap-2.5 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
                  <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                  <span>
                    <strong>
                      {skipped} block{skipped === 1 ? "" : "s"} will be skipped.
                    </strong>{" "}
                    This site has no block of type{" "}
                    {[...new Set(staged.unsupported.map((s) => s.type))].map(
                      (type, index, all) => (
                        <span key={type}>
                          <code className="rounded bg-amber-100 px-1 py-0.5">
                            {type}
                          </code>
                          {index < all.length - 1 ? ", " : ""}
                        </span>
                      ),
                    )}
                    . The file was probably written by a newer build.
                  </span>
                </div>
              )}
            </>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!staged || busy}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#37469E] px-5 py-2 text-sm font-semibold text-white hover:bg-[#2C3A85] disabled:opacity-60"
            >
              {busy ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Upload size={15} />
              )}
              Import page
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
