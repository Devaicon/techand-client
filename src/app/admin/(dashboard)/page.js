"use client";

import { useEffect, useState } from "react";
import { Users, UserPlus } from "lucide-react";
import adminApi from "@/lib/adminApi";
import { useAdminAuth } from "../AdminAuthProvider";

export default function AdminOverview() {
  const { user, can } = useAdminAuth();
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
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-4 inline-flex rounded-xl bg-[#EEF0FA] p-3 text-[#37469E]">
        <Icon size={22} />
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}
