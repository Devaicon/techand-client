"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Shield, Ban, CheckCircle2, Trash2 } from "lucide-react";
import adminApi from "@/lib/adminApi";
import { useAdminAuth } from "../../AdminAuthProvider";
import PermissionEditor, { ROLE_PRESETS } from "@/components/admin/PermissionEditor";

const sameSet = (a, b) =>
  (a || []).length === (b || []).length &&
  [...(a || [])].sort().join() === [...(b || [])].sort().join();

export default function UsersPage() {
  const { can } = useAdminAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
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

  const savePermissions = async ({ role, permissions, isCustom }) => {
    if (role !== editing.role) {
      await adminApi.patch(`/users/${editing.id}/role`, { role });
    }
    // If the role changed to a preset match, the role endpoint already set it.
    const presetMatch = !isCustom && sameSet(permissions, ROLE_PRESETS[role]);
    if (role === editing.role || !presetMatch) {
      if (role !== "super_admin") {
        await adminApi.patch(`/users/${editing.id}/permissions`, { permissions });
      }
    }
    await load();
  };

  const toggleStatus = async (u) => {
    const status = u.status === "active" ? "suspended" : "active";
    await adminApi.patch(`/users/${u.id}/status`, { status });
    await load();
  };

  const remove = async (u) => {
    if (!confirm(`Delete ${u.username}? This cannot be undone.`)) return;
    await adminApi.delete(`/users/${u.id}`);
    await load();
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#37469E]" /></div>;
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Users</h1>
      {error && <p className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-100 text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
            <tr>
              <th className="px-6 py-3">User</th>
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
                    <p className="font-medium text-gray-900">{u.username}</p>
                    <p className="text-gray-500">{u.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#EEF0FA] px-2.5 py-1 text-xs font-medium text-[#37469E]">
                      <Shield size={12} />{u.role}{custom ? " (custom)" : ""}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${u.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {can("team:manage") && (
                        <button onClick={() => setEditing(u)} className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#37469E] hover:bg-[#EEF0FA]">
                          Permissions
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
          onSave={savePermissions}
        />
      )}
    </div>
  );
}
