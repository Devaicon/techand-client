"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check, Eye, ImageIcon, ImageOff, Images, Loader2,
} from "lucide-react";
import adminApi from "@/lib/adminApi";
import { useToast } from "@/components/admin/Toast";
import { useBlogQueues } from "@/app/admin/BlogQueuesProvider";
import { timeAgo } from "@/lib/blogStatus";

// Posts waiting on their pictures, rendered identically on the overview and on
// the Artwork page. Mirrors ApprovalQueue deliberately: the two stages are the
// same job at different points, and someone who works both should not have to
// learn two layouts.
//
// The primary action is "Add images", which is just the editor — there is no
// separate illustration screen. That is the honest UI for the permission
// underneath it, which grants full edit access to a post in this stage rather
// than a cropped-down one. "Send for approval" is the second, deliberate step:
// having pictures and being finished are not the same thing.
export default function ArtworkQueue({ limit = null, onSeeAll = null }) {
  const toast = useToast();
  const { artwork, loading, error, markImagesReady } = useBlogQueues();
  const [busyId, setBusyId] = useState(null);

  const shown = limit ? artwork.slice(0, limit) : artwork;
  const hidden = artwork.length - shown.length;

  const sendOn = async (blog) => {
    setBusyId(blog.id);
    try {
      await markImagesReady(blog.id);
      toast.success(`"${blog.title}" is with the reviewers.`);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Could not send that post for approval.",
      );
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

  if (artwork.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-center">
        <Images size={22} className="text-violet-500" />
        <p className="text-sm font-medium text-gray-700">No posts need images</p>
        <p className="text-sm text-gray-500">
          Submitted insights land here for their artwork before anyone reviews them.
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-100">
      {shown.map((blog) => {
        const busy = busyId === blog.id;
        const author =
          blog.review?.submittedBy?.name ||
          blog.review?.submittedBy?.username ||
          blog.author?.name ||
          "Someone";
        const hasHero = Boolean(blog.heroImage?.url);
        // Counts every save made in this stage, so a post being actively worked
        // on is distinguishable from one nobody has opened yet.
        const passes = (blog.activity || []).filter(
          (a) => a.action === "illustrated",
        ).length;

        return (
          <li key={blog.id} className={`py-4 first:pt-0 ${busy ? "opacity-50" : ""}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900">{blog.title}</p>
                <p className="mt-0.5 text-xs text-gray-500">
                  by {author} · submitted {timeAgo(blog.review?.submittedAt)}
                  {blog.category ? ` · ${blog.category}` : ""}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      hasHero
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {hasHero ? <ImageIcon size={11} /> : <ImageOff size={11} />}
                    {hasHero ? "Hero image set" : "No hero image"}
                  </span>
                  {passes > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-semibold text-violet-700">
                      {passes} edit{passes === 1 ? "" : "s"} so far
                    </span>
                  )}
                </div>
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
                  className="inline-flex items-center gap-1.5 rounded-lg border border-violet-200 px-2.5 py-1.5 text-xs font-semibold text-violet-700 hover:bg-violet-50"
                >
                  <ImageIcon size={14} /> Add images
                </Link>
                <button
                  type="button"
                  onClick={() => sendOn(blog)}
                  disabled={busy}
                  title="Hand this post to the reviewers"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#37469E] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#2C3A85] disabled:opacity-60"
                >
                  {busy ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Check size={14} />
                  )}
                  Send for approval
                </button>
              </div>
            </div>
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
