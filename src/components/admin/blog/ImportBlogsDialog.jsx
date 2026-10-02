"use client";

import { useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileJson,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import adminApi from "@/lib/adminApi";
import { useOverlayMotion } from "@/components/motion";
import {
  buildSampleBlogExport,
  downloadJson,
  fetchAllBlogs,
  importBlogs,
  parseBlogExport,
} from "@/lib/blogTransfer.mjs";

/**
 * Import insight posts from a `.blog.json` file, each as a new draft.
 *
 * Two steps, like ImportPageDialog: pick the file, then confirm. The confirm
 * step lists every post with what will happen to it — imported, skipped
 * because its URL is taken, or blocked by a problem in the file — so the author
 * decides with the whole picture in front of them, not after half a batch has
 * already been written.
 *
 * Never updates an existing post, so there is no destructive path to guard.
 */
export default function ImportBlogsDialog({ onImported, onClose }) {
  const inputRef = useRef(null);

  // null until a file parses. Then: the file name, its entries, and the slugs
  // already in use on this install.
  const [staged, setStaged] = useState(null);
  const [skipExisting, setSkipExisting] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(null);
  const [dragging, setDragging] = useState(false);

  const backdrop = useOverlayMotion("backdrop");
  const dialog = useOverlayMotion("modal");

  const readFile = async (file) => {
    setError("");
    setStaged(null);
    if (!file) return;

    try {
      const { entries } = parseBlogExport(await file.text());
      // Fetched now rather than on open: it is only needed once there is a list
      // of slugs to check, and it covers every post, not the list screen's page.
      const existing = await fetchAllBlogs(adminApi, { status: "all" });
      setStaged({
        fileName: file.name,
        entries,
        taken: new Set(existing.map((b) => b.slug)),
      });
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Could not read that file.",
      );
    }
  };

  const onDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    readFile(event.dataTransfer.files?.[0]);
  };

  // What happens to each entry, given the current toggle.
  const plan = (staged?.entries || []).map((entry) => {
    if (entry.problems.length) return { ...entry, action: "invalid" };
    const slug = entry.post.slug?.trim().toLowerCase();
    if (slug && staged.taken.has(slug)) {
      return { ...entry, action: skipExisting ? "skip" : "rename" };
    }
    return { ...entry, action: "create" };
  });

  const toImport = plan.filter((e) => e.action === "create" || e.action === "rename");
  const clashes = plan.filter((e) => e.action === "skip" || e.action === "rename").length;

  const submit = async (event) => {
    event.preventDefault();
    if (toImport.length === 0) return;

    setBusy(true);
    setError("");
    setProgress({ done: 0, total: toImport.length });
    try {
      const result = await importBlogs(
        adminApi,
        toImport.map((e) => e.post),
        { onProgress: (done, total) => setProgress({ done, total }) },
      );
      onImported({
        ...result,
        skipped: plan.filter((e) => e.action === "skip").length,
        invalid: plan.filter((e) => e.action === "invalid").length,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to import posts.");
      setBusy(false);
      setProgress(null);
    }
  };

  const downloadSample = () =>
    downloadJson(buildSampleBlogExport(), "insights-sample.blog.json");

  return (
    <motion.div
      {...backdrop}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    >
      <motion.div
        {...dialog}
        className="flex max-h-full w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">Import insights</h2>
            <p className="mt-0.5 text-xs leading-5 text-gray-500">
              Creates new <strong>draft</strong> posts from a{" "}
              <code>.blog.json</code> file. Nothing is published and no existing
              post is changed.
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

        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
            {error && (
              <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>
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
                    A <code>.blog.json</code> file from Export, or one written
                    to the sample&rsquo;s format
                  </span>
                </button>

                <input
                  ref={inputRef}
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={(e) => readFile(e.target.files?.[0])}
                />

                <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
                  <FileJson size={18} className="mt-0.5 shrink-0 text-gray-400" />
                  <div className="min-w-0 flex-1 text-xs leading-5 text-gray-600">
                    <p className="font-semibold text-gray-800">
                      Writing a file by hand?
                    </p>
                    <p>
                      The sample is a complete post with every field filled in and
                      a <code>_readme</code> describing each one. It imports as-is.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={downloadSample}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#37469E] hover:bg-[#EEF0FA]"
                  >
                    <Download size={14} /> Sample JSON
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
                  <FileJson size={14} className="shrink-0 text-gray-400" />
                  <span className="truncate">{staged.fileName}</span>
                  <button
                    type="button"
                    onClick={() => setStaged(null)}
                    disabled={busy}
                    className="ml-auto shrink-0 font-semibold text-[#37469E] hover:underline disabled:opacity-50"
                  >
                    Change
                  </button>
                </p>

                <ul className="divide-y divide-gray-100 rounded-xl border border-gray-100">
                  {plan.map((entry, index) => (
                    <li key={index} className="flex items-start gap-3 px-3 py-2.5">
                      {entry.action === "invalid" ? (
                        <AlertTriangle size={16} className="mt-0.5 shrink-0 text-rose-500" />
                      ) : entry.action === "skip" ? (
                        <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-500" />
                      ) : (
                        <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-500" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {entry.post.title || `Post ${index + 1}`}
                        </p>
                        {entry.post.slug && (
                          <p className="truncate text-xs text-gray-500">
                            /insights/{entry.post.slug}
                          </p>
                        )}
                        {entry.action === "invalid" && (
                          <ul className="mt-1 list-disc pl-4 text-xs text-rose-700">
                            {entry.problems.map((problem) => (
                              <li key={problem}>{problem}</li>
                            ))}
                          </ul>
                        )}
                        {entry.action === "skip" && (
                          <p className="mt-0.5 text-xs text-amber-700">
                            Skipped — a post already uses this URL.
                          </p>
                        )}
                        {entry.action === "rename" && (
                          <p className="mt-0.5 text-xs text-gray-500">
                            URL is taken — will be imported with a numbered
                            suffix.
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>

                {clashes > 0 && (
                  <label className="flex items-start gap-2.5 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={skipExisting}
                      onChange={(e) => setSkipExisting(e.target.checked)}
                      disabled={busy}
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-[#37469E]"
                    />
                    <span>
                      Skip posts whose URL already exists
                      <span className="block text-xs text-gray-500">
                        {clashes} post{clashes === 1 ? "" : "s"} in this file
                        match an existing URL. Untick to import them as copies.
                      </span>
                    </span>
                  </label>
                )}
              </>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-5 py-4">
            {progress && (
              <span className="mr-auto text-xs text-gray-500">
                Importing {progress.done} of {progress.total}…
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!staged || busy || toImport.length === 0}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#37469E] px-5 py-2 text-sm font-semibold text-white hover:bg-[#2C3A85] disabled:opacity-60"
            >
              {busy ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
              {staged
                ? `Import ${toImport.length} post${toImport.length === 1 ? "" : "s"}`
                : "Import"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
