"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

// Mirror of server/src/config/rbac.js (UI convenience; server re-validates).
export const ALL_PERMISSIONS = [
  "users:read", "users:create", "users:update", "users:delete",
  "team:invite", "team:manage",
  "blog:read", "blog:create", "blog:update", "blog:delete", "blog:publish",
  "media:upload",
];

export const ROLE_PRESETS = {
  super_admin: ["*"],
  admin: ["users:read","users:create","users:update","team:invite","team:manage","blog:read","blog:create","blog:update","blog:publish","media:upload"],
  editor: ["users:read","blog:read","blog:create","blog:update","blog:publish","media:upload"],
  viewer: ["users:read","blog:read"],
};

const sameSet = (a, b) =>
  a.length === b.length && [...a].sort().join() === [...b].sort().join();

export default function PermissionEditor({ member, onClose, onSave }) {
  const [role, setRole] = useState(member.role);
  const [perms, setPerms] = useState(member.permissions || []);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setRole(member.role);
    setPerms(member.permissions || []);
  }, [member]);

  const isCustom =
    role !== "super_admin" && !sameSet(perms, ROLE_PRESETS[role] || []);

  const changeRole = (r) => {
    setRole(r);
    setPerms(ROLE_PRESETS[r] || []);
  };

  const toggle = (p) =>
    setPerms((cur) =>
      cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p],
    );

  const save = async () => {
    setSaving(true);
    try {
      await onSave({ role, permissions: perms, isCustom });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            Permissions — {member.username}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <label className="mb-2 block text-sm font-medium text-gray-700">Role</label>
        <select
          value={role}
          onChange={(e) => changeRole(e.target.value)}
          className="mb-4 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
        >
          {Object.keys(ROLE_PRESETS).map((r) => (
            <option key={r} value={r}>{r}{isCustom && r === role ? " (custom)" : ""}</option>
          ))}
        </select>

        {role === "super_admin" ? (
          <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
            Super admins have all permissions. Individual toggles are disabled.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {ALL_PERMISSIONS.map((p) => (
              <label key={p} className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={perms.includes(p)}
                  onChange={() => toggle(p)}
                  className="rounded border-gray-300 text-[#37469E]"
                />
                {p}
              </label>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="rounded-lg bg-[#37469E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2C3A85] disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
