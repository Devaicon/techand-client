"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, UserPlus, ShieldCheck } from "lucide-react";
import adminApi from "@/lib/adminApi";
import { useAdminAuth } from "../AdminAuthProvider";
import { usePendingApprovals } from "../PendingApprovalsProvider";
import ApprovalQueue from "@/components/admin/blog/ApprovalQueue";

// How many of the queue to show on the dashboard before deferring to the
// Approvals page. Enough to act on the backlog without the summary becoming
// the whole page.
const QUEUE_PREVIEW = 4;

export default function AdminOverview() {
  const { user, can } = useAdminAuth();
  const { count: pendingCount, canApprove } = usePendingApprovals();
  const [stats, setStats] = useState({ members: 0, invites: 0 });

  useEffect(() => {
    async function load() {
      try {
        const members = await adminApi.get("/team/members");
        let invites = { data: { data: { invites: [] } } };
        if (can("team:manage")) invites = await adminApi.get("/team/invites");
        setStats({
          members: members.data.data.members.length,
          invites: invites.data.data.invites.length,
        });
      } catch {
        /* gated users may lack team:manage; ignore */
      }
    }
    load();
  }, [can]);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-gray-900">
        Welcome, {user?.username}
      </h1>
      <p className="mb-8 text-gray-500">Here&apos;s your team at a glance.</p>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={Users} label="Team members" value={stats.members} />
        <StatCard icon={UserPlus} label="Pending invites" value={stats.invites} />
        {canApprove && (
          <StatCard
            icon={ShieldCheck}
            label="Awaiting your approval"
            value={pendingCount}
            highlight={pendingCount > 0}
          />
        )}
      </div>

      {/* The queue itself, not just its count: an approval that costs a click to
          find is an approval that waits another day. */}
      {canApprove && (
        <section className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-gray-900">
              Waiting for your approval
            </h2>
            <Link
              href="/admin/approvals"
              className="text-sm font-semibold text-[#37469E] hover:underline"
            >
              Open queue →
            </Link>
          </div>
          <ApprovalQueue limit={QUEUE_PREVIEW} onSeeAll="/admin/approvals" />
        </section>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, highlight = false }) {
  return (
    <div
      className={`rounded-2xl border bg-white p-6 shadow-sm ${
        highlight ? "border-amber-200" : "border-gray-100"
      }`}
    >
      <div
        className={`mb-4 inline-flex rounded-xl p-3 ${
          highlight ? "bg-amber-50 text-amber-600" : "bg-[#EEF0FA] text-[#37469E]"
        }`}
      >
        <Icon size={22} />
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}
