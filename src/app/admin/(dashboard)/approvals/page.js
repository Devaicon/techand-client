"use client";

import Link from "next/link";
import { Loader2, RefreshCw } from "lucide-react";
import { useAdminAuth } from "../../AdminAuthProvider";
import { usePendingApprovals } from "../../PendingApprovalsProvider";
import ApprovalQueue from "@/components/admin/blog/ApprovalQueue";

export default function ApprovalsPage() {
  const { loading: authLoading } = useAdminAuth();
  const { count, canApprove, loading, refresh } = usePendingApprovals();

  if (authLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-[#37469E]" />
      </div>
    );
  }

  // Reachable by typing the URL even without the permission — the sidebar hides
  // the entry, but a bookmark does not.
  if (!canApprove) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
        <p className="mb-1 text-gray-600">You cannot review submissions</p>
        <p className="text-sm text-gray-500">
          Ask an admin for the <code className="text-gray-600">blog:approve</code>{" "}
          permission, or head back to{" "}
          <Link href="/admin/blogs" className="font-medium text-[#37469E] hover:underline">
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
            Approvals
            {count > 0 && (
              <span className="ml-2 rounded-full bg-amber-100 px-2.5 py-1 align-middle text-sm font-bold text-amber-700">
                {count}
              </span>
            )}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Insights submitted for review, oldest first.
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
        <ApprovalQueue />
      </div>
    </div>
  );
}
