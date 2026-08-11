"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import { Mail, RefreshCw, XCircle, Send } from "lucide-react";
import adminApi from "@/lib/adminApi";
import { useAdminAuth } from "../../AdminAuthProvider";
import { labelRole } from "@/components/admin/PermissionEditor";
import UserAvatar, { displayName } from "@/components/admin/UserAvatar";
import {
  Reveal,
  Skeleton,
  SkeletonRows,
  Stagger,
  StaggerItem,
  useInteraction,
} from "@/components/motion";

const ROLES = ["admin", "editor", "viewer"];

export default function TeamPage() {
  const { can } = useAdminAuth();
  const press = useInteraction("button");
  const iconPress = useInteraction("icon");
  const [members, setMembers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("editor");
  const [msg, setMsg] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const m = await adminApi.get("/team/members");
      setMembers(m.data.data.members);
      if (can("team:manage")) {
        const i = await adminApi.get("/team/invites");
        setInvites(i.data.data.invites);
      }
    } finally {
      setLoading(false);
    }
  }, [can]);

  useEffect(() => { load(); }, [load]);

  const invite = async (e) => {
    e.preventDefault();
    setMsg(null);
    try {
      await adminApi.post("/team/invites", { email, role });
      setEmail("");
      setMsg({ ok: true, text: `Invitation sent to ${email}` });
      await load();
    } catch (err) {
      setMsg({ ok: false, text: err.response?.data?.message || "Failed to invite" });
    }
  };

  const resend = async (id) => { await adminApi.post(`/team/invites/${id}/resend`); await load(); };
  const revoke = async (id) => { await adminApi.delete(`/team/invites/${id}`); await load(); };

  if (loading) {
    return (
      <div className="space-y-8" aria-busy="true" aria-label="Loading team">
        <Skeleton className="h-7 w-24" />
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <Skeleton className="mb-4 h-5 w-40" />
          <SkeletonRows count={4} />
        </div>
      </div>
    );
  }

  return (
    <Stagger className="space-y-8">
      <StaggerItem as="h1" className="text-2xl font-bold text-gray-900">
        Team
      </StaggerItem>

      {can("team:invite") && (
        <StaggerItem className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Invite a member</h2>
          <form onSubmit={invite} className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[220px]">
              <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="new.member@techand.ai"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm">
                {ROLES.map((r) => <option key={r} value={r}>{labelRole(r)}</option>)}
              </select>
            </div>
            <motion.button {...press} type="submit" className="flex items-center gap-2 rounded-lg bg-[#37469E] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2C3A85]">
              <Send size={15} />Send invite
            </motion.button>
          </form>
          {/* The result of an invite is the one thing on this page worth
              announcing with movement — it appears in response to an action
              rather than on load. Keyed on the text so a second invite replays
              the entrance instead of silently swapping the words. */}
          {msg && (
            <Reveal
              key={msg.text}
              as="p"
              variant="fall"
              className={`mt-3 text-sm ${msg.ok ? "text-emerald-600" : "text-rose-600"}`}
            >
              {msg.text}
            </Reveal>
          )}
        </StaggerItem>
      )}

      {can("team:manage") && invites.length > 0 && (
        <StaggerItem className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Pending invites</h2>
          {/* A nested cascade. The inner `Stagger` sets its own initial/animate,
              so it starts an independent tree rather than inheriting the outer
              one — which is what stops these rows waiting on the card above
              them to finish. */}
          <Stagger as="ul" className="divide-y divide-gray-100">
            {invites.map((inv) => (
              <StaggerItem as="li" key={inv._id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{inv.email}</p>
                    <p className="text-xs text-gray-500">{labelRole(inv.role)} · expires {new Date(inv.expiresAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button {...iconPress} onClick={() => resend(inv._id)} title="Resend" className="text-gray-400 transition-colors hover:text-[#37469E]"><RefreshCw size={16} /></motion.button>
                  <motion.button {...iconPress} onClick={() => revoke(inv._id)} title="Revoke" className="text-gray-400 transition-colors hover:text-rose-600"><XCircle size={16} /></motion.button>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </StaggerItem>
      )}

      <StaggerItem className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Members ({members.length})</h2>
        <Stagger as="ul" className="divide-y divide-gray-100">
          {members.map((m) => (
            <StaggerItem as="li" key={m.id} className="flex items-center justify-between gap-3 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <UserAvatar user={m} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {displayName(m)}
                    {m.name && (
                      <span className="ml-1.5 font-normal text-gray-400">
                        @{m.username}
                      </span>
                    )}
                  </p>
                  <p className="truncate text-xs text-gray-500">{m.email}</p>
                </div>
              </div>
              <span className="rounded-full bg-[#EEF0FA] px-2.5 py-1 text-xs font-medium text-[#37469E]">{labelRole(m.role)}</span>
            </StaggerItem>
          ))}
        </Stagger>
      </StaggerItem>
    </Stagger>
  );
}
