"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Loader2, Shield, Ban, CheckCircle2, Trash2, SlidersHorizontal, KeyRound,
  Pencil, Check, X,
} from "lucide-react";
import adminApi from "@/lib/adminApi";
import { useToast } from "@/components/admin/Toast";
import { useAdminAuth } from "../../AdminAuthProvider";
import PermissionEditor, { ROLE_PRESETS, labelRole } from "@/components/admin/PermissionEditor";
import ResetPasswordDialog from "@/components/admin/ResetPasswordDialog";
import UserAvatar from "@/components/admin/UserAvatar";

const sameSet = (a, b) =>
  (a || []).length === (b || []).length &&
  [...(a || [])].sort().join() === [...(b || [])].sort().join();

export default function UsersPage() {
  const { can } = useAdminAuth();
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [resetting, setResetting] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.get("/users");
      setUsers(data.data.users);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

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

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#37469E]" /></div>;
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Users</h1>
      {error && <p className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}

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
