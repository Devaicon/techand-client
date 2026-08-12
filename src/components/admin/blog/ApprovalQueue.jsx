"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle, Check, Eye, ImageOff, Loader2, Pencil, ShieldCheck, X,
} from "lucide-react";
import adminApi from "@/lib/adminApi";
import { useToast } from "@/components/admin/Toast";
import { useBlogQueues } from "@/app/admin/BlogQueuesProvider";
import { timeAgo } from "@/lib/blogStatus";

// The list of posts waiting on a reviewer, rendered identically on the overview
// and on the Approvals page. `limit` truncates the overview copy — the whole
// backlog belongs on the dedicated page, not on a dashboard summary.
export default function ApprovalQueue({ limit = null, onSeeAll = null }) {
  const toast = useToast();
  const { approvals: blogs, loading, error, decide } = useBlogQueues();
  const [busyId, setBusyId] = useState(null);
  // Which row has its "send back" note open. Rejecting inline rather than in a
  // modal keeps the post's title and author on screen while the reason is
  // written, which is the context the reason is about.
  const [rejectingId, setRejectingId] = useState(null);
  const [note, setNote] = useState("");

  const shown = limit ? blogs.slice(0, limit) : blogs;
  const hidden = blogs.length - shown.length;

  const runDecision = async (blog, decision, reason = "") => {
    setBusyId(blog.id);
    try {
      await decide(blog.id, decision, reason);
      setRejectingId(null);
      setNote("");
      toast.success(
        decision === "approve"
          ? `"${blog.title}" is live.`
          : `"${blog.title}" was sent back to its author.`,
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to record that decision.");
    } finally {
      setBusyId(null);
    }
  };

  const openPreview = async (blog) => {
    setBusyId(blog.id);
    try {
      const { data } = await adminApi.get(`/blogs/${blog.id}/preview-link`);
      window.open(data.data.url, "_blank", "noopener,noreferrer");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not build a preview link.");
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="animate-spin text-[#37469E]" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>
    );
  }

  if (blogs.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-center">
        <ShieldCheck size={22} className="text-emerald-500" />
        <p className="text-sm font-medium text-gray-700">Nothing awaiting approval</p>
        <p className="text-sm text-gray-500">
          Insights land here once their artwork is done.
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-100">
      {shown.map((blog) => {
        const busy = busyId === blog.id;
        const rejecting = rejectingId === blog.id;
        const submitter =
          blog.review?.submittedBy?.name ||
          blog.review?.submittedBy?.username ||
          blog.author?.name ||
          "Someone";
        const illustrator =
          blog.review?.illustratedBy?.name ||
          blog.review?.illustratedBy?.username ||
          "";
        // The artwork stage hands out full edit access, so the one thing a
        // reviewer must not have to go looking for is whether the person who
        // was only meant to add pictures also rewrote something.
        const textTouched = (blog.activity || []).some(
          (a) => a.action === "illustrated" && a.textChanged,
        );

        return (
          <li key={blog.id} className={`py-4 first:pt-0 ${busy ? "opacity-50" : ""}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900">{blog.title}</p>
                <p className="mt-0.5 text-xs text-gray-500">
                  by {submitter} · submitted {timeAgo(blog.review?.submittedAt)}
                  {illustrator ? ` · artwork by ${illustrator}` : ""}
                  {blog.category ? ` · ${blog.category}` : ""}
                </p>
                {(textTouched || !blog.heroImage?.url) && (
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    {textTouched && (
                      <span
                        title="Someone edited the article text during the artwork stage"
                        className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700"
                      >
                        <AlertTriangle size={11} /> Text edited after submission
                      </span>
                    )}
                    {!blog.heroImage?.url && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">
                        <ImageOff size={11} /> No hero image
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => openPreview(blog)}
                  disabled={busy}
                  title="Read the submitted draft"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                >
                  <Eye size={14} /> Preview
                </button>
                <Link
                  href={`/admin/blogs/${blog.id}/edit`}
                  title="Open in the editor"
                  className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50 hover:text-[#37469E]"
                >
                  <Pencil size={14} />
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setRejectingId(rejecting ? null : blog.id);
                    setNote("");
                  }}
                  disabled={busy}
                  aria-expanded={rejecting}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                >
                  <X size={14} /> Reject
                </button>
                <button
                  type="button"
                  onClick={() => runDecision(blog, "approve")}
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#37469E] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#2C3A85] disabled:opacity-60"
                >
                  {busy ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Check size={14} />
                  )}
                  Approve
                </button>
              </div>
            </div>

            {rejecting && (
              <div className="mt-3 rounded-xl border border-rose-100 bg-rose-50/60 p-3">
                <label
                  htmlFor={`reject-note-${blog.id}`}
                  className="mb-1.5 block text-xs font-semibold text-rose-800"
                >
                  What needs to change?
                </label>
                <textarea
                  id={`reject-note-${blog.id}`}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  maxLength={2000}
                  placeholder="Optional, but this is all the author will see."
                  className="w-full resize-y rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm focus:border-rose-400 focus:outline-none"
                />
                <div className="mt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setRejectingId(null)}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => runDecision(blog, "reject", note.trim())}
                    disabled={busy}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
                  >
                    {busy && <Loader2 size={14} className="animate-spin" />}
                    Send back
                  </button>
                </div>
              </div>
            )}
          </li>
        );
      })}

      {hidden > 0 && onSeeAll && (
        <li className="pt-4">
          <Link
            href={onSeeAll}
            className="text-sm font-semibold text-[#37469E] hover:underline"
          >
            {hidden} more waiting →
          </Link>
        </li>
      )}
    </ul>
  );
}
