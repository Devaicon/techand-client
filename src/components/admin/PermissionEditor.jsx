"use client";

import { useState, useEffect } from "react";
import { X, Loader2, ChevronDown } from "lucide-react";

// Mirror of server/src/config/rbac.js (UI convenience; server re-validates).
export const ALL_PERMISSIONS = [
  "users:read", "users:create", "users:update", "users:delete",
  "team:invite", "team:manage",
  "blog:read", "blog:create", "blog:update", "blog:delete", "blog:publish",
  "blog:approve", "blog:illustrate",
  "media:upload",
  "pages:read", "pages:manage",
  "navbar:manage",
];

// What a permission actually lets someone do. The toggle labels are derived
// from the string ("blog:illustrate" → "ILLUSTRATE"), which is fine for the
// obvious ones and useless for the rest — nobody can tell APPROVE from PUBLISH,
// or guess that ILLUSTRATE hands out full edit access to a post in the artwork
// stage. Anything not listed here renders with its label alone.
export const PERMISSION_HINTS = {
  "blog:publish": "Put a post live immediately, with no review.",
  "blog:approve":
    "Work the approval queue — approve or send back posts whose artwork is done.",
  "blog:illustrate":
    "Work the artwork queue. Full edit access to a post while it waits for images, and every save is recorded in its history.",
  "team:invite": "Send invitations.",
  "team:manage": "See pending invitations, and change roles and permissions.",
  "users:update": "Rename accounts, suspend them, and reset their passwords.",
};

// Group permissions by their resource prefix ("users:read" -> "users"),
// preserving first-appearance order, for the accordion sections.
const PERMISSION_GROUPS = ALL_PERMISSIONS.reduce((groups, p) => {
  const key = p.split(":")[0];
  const group = groups.find((g) => g.key === key);
  if (group) group.perms.push(p);
  else groups.push({ key, perms: [p] });
  return groups;
}, []);

// Mirror of ROLE_PRESETS in server/src/config/rbac.js. Drift here is not
// cosmetic: `isCustom` below compares a user's permissions against this list, so
// a missing entry labels a perfectly standard admin as "(CUSTOM)".
export const ROLE_PRESETS = {
  super_admin: ["*"],
  admin: ["users:read","users:create","users:update","team:invite","team:manage","blog:read","blog:create","blog:update","blog:publish","blog:approve","blog:illustrate","media:upload","pages:read","pages:manage","navbar:manage"],
  editor: ["users:read","blog:read","blog:create","blog:update","media:upload","pages:read"],
  viewer: ["users:read","blog:read","pages:read"],
};

const sameSet = (a, b) =>
  a.length === b.length && [...a].sort().join() === [...b].sort().join();

// Display helper: "super_admin" -> "SUPER ADMIN".
export const labelRole = (r) => (r || "").replace(/_/g, " ").toUpperCase();

export default function PermissionEditor({
  member,
  onClose,
  onRoleChange,
  onPermissionsChange,
}) {
  const [role, setRole] = useState(member.role);
  const [perms, setPerms] = useState(member.permissions || []);
  const [busy, setBusy] = useState(null); // null | "role" | "<permission>"
  const [error, setError] = useState("");
  const [openGroups, setOpenGroups] = useState(() =>
    Object.fromEntries(PERMISSION_GROUPS.map((g, i) => [g.key, i === 0])),
  );

  const toggleGroup = (key) =>
    setOpenGroups((o) => ({ ...o, [key]: !o[key] }));

  // Re-seed only when a different user is opened, so live-sync toggles are
  // not clobbered when the parent updates the underlying user object.
  useEffect(() => {
    setRole(member.role);
    setPerms(member.permissions || []);
    setError("");
  }, [member.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const isCustom =
    role !== "super_admin" && !sameSet(perms, ROLE_PRESETS[role] || []);
  const disabled = busy !== null;

  const changeRole = async (r) => {
    if (r === role) return;
    const prevRole = role;
    const prevPerms = perms;
    setError("");
    setRole(r);
    setPerms(ROLE_PRESETS[r] || []); // server resets perms to the preset
    setBusy("role");
    try {
      await onRoleChange(r);
    } catch (err) {
      setRole(prevRole);
      setPerms(prevPerms);
      setError(err?.response?.data?.message || "Failed to update role.");
    } finally {
      setBusy(null);
    }
  };

  const toggle = async (p) => {
    const prevPerms = perms;
    const next = perms.includes(p)
      ? perms.filter((x) => x !== p)
      : [...perms, p];
    setError("");
    setPerms(next);
    setBusy(p);
    try {
      await onPermissionsChange(next);
    } catch (err) {
      setPerms(prevPerms);
      setError(err?.response?.data?.message || "Failed to update permission.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex shrink-0 items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            PERMISSIONS — {(member.username || "").toUpperCase()}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="-mr-2 flex-1 overflow-y-auto pr-2">
        {error && (
          <p className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </p>
        )}

        <label className="mb-2 block text-sm font-medium text-gray-700">ROLE</label>
        <select
          value={role}
          onChange={(e) => changeRole(e.target.value)}
          disabled={disabled}
          className="mb-4 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm disabled:opacity-60"
        >
          {Object.keys(ROLE_PRESETS).map((r) => (
            <option key={r} value={r}>
              {labelRole(r)}{isCustom && r === role ? " (CUSTOM)" : ""}
            </option>
          ))}
        </select>

        {role === "super_admin" ? (
          <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
            Super admins have all permissions. Individual toggles are disabled.
          </p>
        ) : (
          <div className="space-y-2">
            {PERMISSION_GROUPS.map((group) => {
              const isOpen = openGroups[group.key];
              const enabled = group.perms.filter((p) => perms.includes(p)).length;
              return (
                <div key={group.key} className="overflow-hidden rounded-lg border border-gray-200">
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.key)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between px-3 py-2.5 text-left hover:bg-gray-50"
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                      <ChevronDown
                        size={16}
                        className={`text-gray-400 transition-transform ${isOpen ? "" : "-rotate-90"}`}
                      />
                      {group.key.toUpperCase()}
                    </span>
                    <span className="text-xs font-medium text-gray-400">
                      {enabled}/{group.perms.length}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="space-y-1 border-t border-gray-100 px-3 py-2">
                      {group.perms.map((p) => {
                        const on = perms.includes(p);
                        const saving = busy === p;
                        return (
                          <div
                            key={p}
                            className="flex items-start justify-between gap-3 rounded-lg py-1.5"
                          >
                            <span className="min-w-0">
                              <span className="block text-sm font-medium text-gray-700">
                                {p.split(":")[1].toUpperCase()}
                              </span>
                              {PERMISSION_HINTS[p] && (
                                <span className="mt-0.5 block text-xs leading-relaxed text-gray-500">
                                  {PERMISSION_HINTS[p]}
                                </span>
                              )}
                            </span>
                            <div className="flex shrink-0 items-center gap-2 pt-0.5">
                              {saving && (
                                <Loader2 size={14} className="animate-spin text-gray-400" />
                              )}
                              <button
                                type="button"
                                role="switch"
                                aria-checked={on}
                                aria-label={p}
                                disabled={disabled}
                                onClick={() => toggle(p)}
                                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${on ? "bg-[#37469E]" : "bg-gray-300"}`}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${on ? "translate-x-6" : "translate-x-1"}`}
                                />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        </div>

        <div className="mt-6 flex shrink-0 justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-[#37469E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2C3A85]"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
