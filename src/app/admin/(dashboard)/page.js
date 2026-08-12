"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, UserPlus, ShieldCheck, Images } from "lucide-react";
import adminApi from "@/lib/adminApi";
import { useAdminAuth } from "../AdminAuthProvider";
import { useBlogQueues } from "../BlogQueuesProvider";
import ApprovalQueue from "@/components/admin/blog/ApprovalQueue";
import ArtworkQueue from "@/components/admin/blog/ArtworkQueue";
import { displayName } from "@/components/admin/UserAvatar";

// How many of each queue to show on the dashboard before deferring to its own
// page. Enough to act on the backlog without the summary becoming the whole
// page.
const QUEUE_PREVIEW = 4;

export default function AdminOverview() {
  const { user, can } = useAdminAuth();
  const { approvalCount, artworkCount, canApprove, canIllustrate } =
    useBlogQueues();
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
        Welcome, {displayName(user) || user?.username}
      </h1>
      <p className="mb-8 text-gray-500">Here&apos;s your team at a glance.</p>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={Users} label="Team members" value={stats.members} />
        <StatCard icon={UserPlus} label="Pending invites" value={stats.invites} />
        {canIllustrate && (
          <StatCard
            icon={Images}
            label="Waiting on images"
            value={artworkCount}
            tone={artworkCount > 0 ? "violet" : "default"}
          />
        )}
        {canApprove && (
          <StatCard
            icon={ShieldCheck}
            label="Awaiting your approval"
            value={approvalCount}
            tone={approvalCount > 0 ? "amber" : "default"}
          />
        )}
      </div>

      {/* The queues themselves, not just their counts: work that costs a click
          to find is work that waits another day.

          Artwork sits above approvals because it comes first in the pipeline —
          for someone who holds both permissions, this is the order they will
          actually work the two lists in. */}
      {canIllustrate && (
        <section className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-gray-900">Waiting for images</h2>
            <Link
              href="/admin/artwork"
              className="text-sm font-semibold text-[#37469E] hover:underline"
            >
              Open queue →
            </Link>
          </div>
          <ArtworkQueue limit={QUEUE_PREVIEW} onSeeAll="/admin/artwork" />
        </section>
      )}

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

// A card lights up in its stage's colour only while that stage has something in
// it — the same violet/amber split the status badges use, so a full artwork
// queue reads the same here as it does in the Insights list.
const TONES = {
  default: { border: "border-gray-100", chip: "bg-[#EEF0FA] text-[#37469E]" },
  violet: { border: "border-violet-200", chip: "bg-violet-50 text-violet-600" },
  amber: { border: "border-amber-200", chip: "bg-amber-50 text-amber-600" },
};

function StatCard({ icon: Icon, label, value, tone = "default" }) {
  const { border, chip } = TONES[tone] || TONES.default;
  return (
    <div className={`rounded-2xl border bg-white p-6 shadow-sm ${border}`}>
      <div className={`mb-4 inline-flex rounded-xl p-3 ${chip}`}>
        <Icon size={22} />
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}
