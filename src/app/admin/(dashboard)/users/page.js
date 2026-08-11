"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Loader2, Shield, Ban, CheckCircle2, Trash2, SlidersHorizontal, KeyRound,
  Pencil, Check, X, UserPlus, Mail, RefreshCw, XCircle,
} from "lucide-react";
import { AnimatePresence } from "motion/react";
import adminApi from "@/lib/adminApi";
import { useToast } from "@/components/admin/Toast";
import { useAdminAuth } from "../../AdminAuthProvider";
import PermissionEditor, { ROLE_PRESETS, labelRole } from "@/components/admin/PermissionEditor";
import ResetPasswordDialog from "@/components/admin/ResetPasswordDialog";
import InviteMemberDialog from "@/components/admin/InviteMemberDialog";
import UserAvatar from "@/components/admin/UserAvatar";
import { formatDate } from "@/lib/blogStatus";

const sameSet = (a, b) =>
  (a || []).length === (b || []).length &&
  [...(a || [])].sort().join() === [...(b || [])].sort().join();

// Everyone with access to the panel, and everyone on their way in.
//
// This page absorbed the old /admin/team, which listed the same members
// read-only and owned invitations. Two pages for one subject meant an admin
// looking at a person had to guess which of them held the control they wanted —
// and the members list on Team was a strictly worse copy of the table here.
export default function UsersPage() {
  const { can } = useAdminAuth();
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [resetting, setResetting] = useState(null);
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState("");

  const canManageInvites = can("team:manage");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.get("/users");
      setUsers(data.data.users);
      // Listing pending invitations is team:manage; sending one is team:invite.
      // Someone who can only send them still gets the button, just not the list.
      if (canManageInvites) {
        const i = await adminApi.get("/team/invites");
        setInvites(i.data.data.invites);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [canManageInvites]);

  useEffect(() => { load(); }, [load]);

  // Merge the server's returned user into the list (live-sync, no full reload).
  const applyUser = (updated) =>
    setUsers((us) => us.map((u) => (u.id === updated.id ? { ...u, ...updated } : u)));

  const changeRole = async (role) => {
    try {
      const { data } = await adminApi.patch(`/users/${editing.id}/role`, {
        role,
      });
      applyUser(data.data.user);
      toast.success(`Role changed to ${role}.`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change the role.");
    }
  };

  const changePermissions = async (permissions) => {
    try {
      const { data } = await adminApi.patch(
        `/users/${editing.id}/permissions`,
        { permissions },
      );
      applyUser(data.data.user);
      toast.success("Permissions updated.");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to update permissions.",
      );
    }
  };

  const saveName = async (u, name) => {
    try {
      const { data } = await adminApi.patch(`/users/${u.id}/name`, { name });
      applyUser(data.data.user);
      toast.success(name ? `Name set to "${name}".` : "Name cleared.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to set the name.");
      throw err;
    }
  };

  const toggleStatus = async (u) => {
    const status = u.status === "active" ? "suspended" : "active";
    try {
      await adminApi.patch(`/users/${u.id}/status`, { status });
      await load();
      toast.success(
        status === "suspended"
          ? `${u.username} suspended.`
          : `${u.username} reinstated.`,
      );
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to change the account status.",
      );
    }
  };

  const remove = async (u) => {
    if (!confirm(`Delete ${u.username}? This cannot be undone.`)) return;
    try {
      await adminApi.delete(`/users/${u.id}`);
      await load();
      toast.success(`${u.username} deleted.`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete the user.");
    }
  };

  const resendInvite = async (inv) => {
    try {
      await adminApi.post(`/team/invites/${inv.id}/resend`);
      await load();
      toast.success(`Invitation resent to ${inv.email}.`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend.");
    }
  };

  const revokeInvite = async (inv) => {
    if (!confirm(`Revoke the invitation to ${inv.email}?`)) return;
    try {
      await adminApi.delete(`/team/invites/${inv.id}`);
      setInvites((is) => is.filter((i) => i.id !== inv.id));
      toast.success(`Invitation to ${inv.email} revoked.`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to revoke.");
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#37469E]" /></div>;
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="mt-1 text-sm text-gray-500">
            {users.length} member{users.length === 1 ? "" : "s"}
            {invites.length > 0 && `, ${invites.length} invitation${invites.length === 1 ? "" : "s"} pending`}
          </p>
        </div>
        {can("team:invite") && (
          <button
            type="button"
            onClick={() => setInviting(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#37469E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2C3A85]"
          >
            <UserPlus size={16} /> Invite member
          </button>
        )}
      </div>

      {error && <p className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}

      {/* Above the table on purpose: an invitation is the only thing on this
          page with a deadline on it, and it disappears from view the moment it
          is accepted. */}
      {canManageInvites && invites.length > 0 && (
        <section className="mb-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <h2 className="border-b border-gray-100 bg-gray-50 px-6 py-3 text-xs font-semibold uppercase text-gray-500">
            Pending invitations
          </h2>
          <ul className="divide-y divide-gray-100">
            {invites.map((inv) => (
              <li key={inv.id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="inline-flex rounded-lg bg-amber-50 p-2 text-amber-600">
                    <Mail size={15} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">{inv.email}</p>
                    <p className="text-xs text-gray-500">
                      {labelRole(inv.role)} · expires {formatDate(inv.expiresAt)}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() => resendInvite(inv)}
                    title="Resend the invitation"
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-[#37469E]"
                  >
                    <RefreshCw size={16} />
                  </button>
                  <button
                    onClick={() => revokeInvite(inv)}
                    title="Revoke the invitation"
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-rose-50 hover:text-rose-600"
                  >
                    <XCircle size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-100 text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
            <tr>
              <th className="px-6 py-3">User</th>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => {
              const custom = u.role !== "super_admin" && !sameSet(u.permissions, ROLE_PRESETS[u.role]);
              return (
                <tr key={u.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <UserAvatar user={u} />
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900">{u.username}</p>
                        <p className="truncate text-gray-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <NameCell
                      user={u}
                      editable={can("users:update")}
                      onSave={(name) => saveName(u, name)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#EEF0FA] px-2.5 py-1 text-xs font-medium text-[#37469E]">
                      <Shield size={12} />{labelRole(u.role)}{custom ? " (CUSTOM)" : ""}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${u.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                      {u.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {can("team:manage") && (
                        <button onClick={() => setEditing(u)} title="Permissions" className="rounded-lg p-1.5 text-[#37469E] hover:bg-[#EEF0FA]">
                          <SlidersHorizontal size={16} />
                        </button>
                      )}
                      {can("users:update") && (
                        <button onClick={() => setResetting(u)} title="Reset password" className="text-gray-400 hover:text-[#37469E]">
                          <KeyRound size={16} />
                        </button>
                      )}
                      {can("users:update") && (
                        <button onClick={() => toggleStatus(u)} title={u.status === "active" ? "Suspend" : "Reactivate"} className="text-gray-400 hover:text-gray-700">
                          {u.status === "active" ? <Ban size={16} /> : <CheckCircle2 size={16} />}
                        </button>
                      )}
                      {can("users:delete") && (
                        <button onClick={() => remove(u)} title="Delete" className="text-gray-400 hover:text-rose-600">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* `AnimatePresence` so dismissing the dialog fades it out instead of
          having it vanish — an `exit` prop alone does nothing once React has
          already removed the element. */}
      <AnimatePresence>
        {inviting && (
          <InviteMemberDialog
            key="invite"
            onClose={() => setInviting(false)}
            onSent={(email) => {
              toast.success(`Invitation sent to ${email}.`);
              load();
            }}
          />
        )}
      </AnimatePresence>

      {editing && (
        <PermissionEditor
          member={editing}
          onClose={() => setEditing(null)}
          onRoleChange={changeRole}
          onPermissionsChange={changePermissions}
        />
      )}

      {resetting && (
        <ResetPasswordDialog
          member={resetting}
          onClose={() => setResetting(null)}
          onDone={(message) => toast.success(message)}
        />
      )}
    </div>
  );
}

// The admin-set name, edited in place. A modal for one text field is heavier
// than the edit is — and this is a field an admin fills in for a whole column of
// people at once, where a dialog per row would be four clicks each.
function NameCell({ user, editable, onSave }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(user.name || "");
  const [busy, setBusy] = useState(false);

  const commit = async () => {
    const next = value.trim();
    if (next === (user.name || "")) {
      setEditing(false);
      return;
    }
    setBusy(true);
    try {
      await onSave(next);
      setEditing(false);
    } catch {
      /* the toast already said so; stay open so the value is not lost */
    } finally {
      setBusy(false);
    }
  };

  if (!editing) {
    return (
      <div className="flex items-center gap-1.5">
        {user.name ? (
          <span className="text-gray-900">{user.name}</span>
        ) : (
          <span className="text-gray-400">Not set</span>
        )}
        {editable && (
          <button
            type="button"
            onClick={() => {
              setValue(user.name || "");
              setEditing(true);
            }}
            title="Set name"
            className="rounded p-1 text-gray-300 hover:bg-gray-100 hover:text-[#37469E]"
          >
            <Pencil size={13} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <input
        type="text"
        value={value}
        autoFocus
        maxLength={120}
        disabled={busy}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") setEditing(false);
        }}
        placeholder="Ali Hassan"
        className="w-36 rounded-lg border border-gray-200 px-2 py-1 text-sm focus:border-[#37469E] focus:outline-none"
      />
      <button
        type="button"
        onClick={commit}
        disabled={busy}
        title="Save"
        className="rounded p-1 text-emerald-600 hover:bg-emerald-50 disabled:opacity-50"
      >
        {busy ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
      </button>
      <button
        type="button"
        onClick={() => setEditing(false)}
        title="Cancel"
        className="rounded p-1 text-gray-400 hover:bg-gray-100"
      >
        <X size={14} />
      </button>
    </div>
  );
}
