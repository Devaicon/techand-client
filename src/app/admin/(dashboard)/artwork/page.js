"use client";

import Link from "next/link";
import { Loader2, RefreshCw } from "lucide-react";
import { useAdminAuth } from "../../AdminAuthProvider";
import { useBlogQueues } from "../../BlogQueuesProvider";
import ArtworkQueue from "@/components/admin/blog/ArtworkQueue";

export default function ArtworkPage() {
  const { loading: authLoading } = useAdminAuth();
  const { artworkCount, canIllustrate, loading, refresh } = useBlogQueues();

  if (authLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-[#37469E]" />
      </div>
    );
  }

  // Reachable by typing the URL even without the permission — the sidebar hides
  // the entry, but a bookmark does not.
  if (!canIllustrate) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
        <p className="mb-1 text-gray-600">You cannot work the artwork queue</p>
        <p className="text-sm text-gray-500">
          Ask an admin for the{" "}
          <code className="text-gray-600">blog:illustrate</code> permission, or
          head back to{" "}
          <Link
            href="/admin/blogs"
            className="font-medium text-[#37469E] hover:underline"
          >
            Insights
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Artwork
            {artworkCount > 0 && (
              <span className="ml-2 rounded-full bg-violet-100 px-2.5 py-1 align-middle text-sm font-bold text-violet-700">
                {artworkCount}
              </span>
            )}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Submitted insights waiting on their images, oldest first. Sending one
            for approval is what notifies the reviewers.
          </p>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <ArtworkQueue />
      </div>
    </div>
  );
}
