"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Info, KeyRound, Loader2, Lock, Save, Shield } from "lucide-react";
import adminApi, { setTokens } from "@/lib/adminApi";
import { useToast } from "@/components/admin/Toast";
import { useAdminAuth } from "../../AdminAuthProvider";
import AvatarField from "@/components/admin/AvatarField";
import { labelRole } from "@/components/admin/PermissionEditor";

const inputClass =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#37469E] focus:outline-none disabled:bg-gray-50 disabled:text-gray-500";

// A short, curated list beats a 400-entry Intl dump: every one of these is a
// zone someone on this team actually works in, and "Other" is a text field
// away via the browser's own datalist behaviour.
const TIMEZONES = [
  "Asia/Dubai", "Asia/Karachi", "Asia/Kolkata", "Asia/Riyadh", "Asia/Singapore",
  "Europe/London", "Europe/Berlin", "Europe/Amsterdam", "America/New_York",
  "America/Chicago", "America/Los_Angeles", "Australia/Sydney", "UTC",
];

function Card({ title, description, children }) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      {description && (
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      )}
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, hint, children, htmlFor }) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-sm font-medium text-gray-700"
      >
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

// The date input wants YYYY-MM-DD; the API sends an ISO timestamp.
const toDateInput = (iso) => (iso ? String(iso).slice(0, 10) : "");

// The switches, each paired with the permission that makes it relevant. Mirrors
// `notifications` on the User model — a key here with no counterpart there is
// silently dropped by the service's allowlist.
const NOTIFICATION_SWITCHES = [
  {
    key: "blogNeedsImages",
    perm: "blog:illustrate",
    label: "An insight needs images",
    description:
      "Sent when someone submits a post and it lands in the artwork queue.",
  },
  {
    key: "blogSubmitted",
    perm: "blog:approve",
    label: "An insight needs approval",
    description:
      "Sent once a post's artwork is finished and it is ready for you to review.",
  },
  {
    key: "blogDecision",
    perm: null,
    label: "A decision on something you wrote",
    description:
      "Sent when a reviewer approves your post or sends it back with changes.",
  },
];

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-gray-100 p-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-800">{label}</p>
        <p className="mt-0.5 text-xs text-gray-500">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          checked ? "bg-[#37469E]" : "bg-gray-300"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

export default function ProfilePage() {
  const toast = useToast();
  const { refresh: refreshSession, can } = useAdminAuth();

  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await adminApi.get("/profile");
      setProfile(data.data.user);
      setForm({ ...data.data.user, dob: toDateInput(data.data.user.dob) });
      setDirty(false);
    } catch (err) {
      setLoadError(err.response?.data?.message || "Failed to load your profile.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const set = (fields) => {
    setForm((f) => ({ ...f, ...fields }));
    setDirty(true);
  };

  const save = async (e) => {
    e?.preventDefault();
    setSaving(true);
    try {
      const { data } = await adminApi.patch("/profile", {
        username: form.username,
        phone: form.phone,
        dob: form.dob,
        country: form.country,
        city: form.city,
        address: form.address,
        timezone: form.timezone,
        jobTitle: form.jobTitle,
        department: form.department,
        bio: form.bio,
        avatar: form.avatar,
        notifications: form.notifications,
      });
      setProfile(data.data.user);
      setForm({ ...data.data.user, dob: toDateInput(data.data.user.dob) });
      setDirty(false);
      // The sidebar renders the session's copy of the user — without this it
      // keeps the old name and avatar until a full reload.
      await refreshSession();
      toast.success("Profile saved.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save your profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loadError) {
    return (
      <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{loadError}</p>
    );
  }

  if (!form) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-[#37469E]" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your profile</h1>
          <p className="mt-1 text-sm text-gray-500">
            How you appear to the rest of the team.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EEF0FA] px-3 py-1.5 text-xs font-semibold text-[#37469E]">
          <Shield size={13} /> {labelRole(profile?.role)}
        </span>
      </div>

      <form onSubmit={save} className="space-y-6">
        <Card title="Photo">
          <AvatarField
            user={profile}
            value={form.avatar}
            onChange={(avatar) => set({ avatar })}
          />
        </Card>

        <Card title="Account">
          <Field
            label="Username"
            htmlFor="username"
            hint="The handle you chose when you joined. Yours to change."
          >
            <input
              id="username"
              type="text"
              value={form.username || ""}
              onChange={(e) => set({ username: e.target.value })}
              className={inputClass}
            />
          </Field>

          {/* Both locked. Stated plainly rather than hidden: a field the user
              can see but not edit needs to say who can, or it reads as a bug. */}
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <p className="mb-3 flex items-start gap-2 text-xs text-gray-500">
              <Info size={14} className="mt-px shrink-0" />
              Your name and email address are set by an administrator. Ask one to
              change them for you.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" htmlFor="name">
                <input
                  id="name"
                  type="text"
                  value={profile?.name || ""}
                  placeholder="Not set by an admin yet"
                  disabled
                  className={inputClass}
                />
              </Field>
              <Field label="Email address" htmlFor="email">
                <input
                  id="email"
                  type="email"
                  value={profile?.email || ""}
                  disabled
                  className={inputClass}
                />
              </Field>
            </div>
          </div>
        </Card>

        <Card title="Work" description="Optional. Shown next to your name in the team list.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Job title" htmlFor="jobTitle">
              <input
                id="jobTitle"
                type="text"
                value={form.jobTitle || ""}
                onChange={(e) => set({ jobTitle: e.target.value })}
                placeholder="Content Lead"
                className={inputClass}
              />
            </Field>
            <Field label="Department" htmlFor="department">
              <input
                id="department"
                type="text"
                value={form.department || ""}
                onChange={(e) => set({ department: e.target.value })}
                placeholder="Marketing"
                className={inputClass}
              />
            </Field>
          </div>
          <Field label="Bio" htmlFor="bio" hint={`${(form.bio || "").length}/600`}>
            <textarea
              id="bio"
              rows={3}
              maxLength={600}
              value={form.bio || ""}
              onChange={(e) => set({ bio: e.target.value })}
              placeholder="A sentence or two about what you work on."
              className={`${inputClass} resize-y`}
            />
          </Field>
        </Card>

        <Card title="Contact" description="Optional. Only visible inside this admin panel.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Phone" htmlFor="phone">
              <input
                id="phone"
                type="tel"
                value={form.phone || ""}
                onChange={(e) => set({ phone: e.target.value })}
                placeholder="+971 50 000 0000"
                className={inputClass}
              />
            </Field>
            <Field label="Date of birth" htmlFor="dob">
              <input
                id="dob"
                type="date"
                value={form.dob || ""}
                onChange={(e) => set({ dob: e.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="Country" htmlFor="country">
              <input
                id="country"
                type="text"
                value={form.country || ""}
                onChange={(e) => set({ country: e.target.value })}
                placeholder="United Arab Emirates"
                className={inputClass}
              />
            </Field>
            <Field label="City" htmlFor="city">
              <input
                id="city"
                type="text"
                value={form.city || ""}
                onChange={(e) => set({ city: e.target.value })}
                placeholder="Dubai"
                className={inputClass}
              />
            </Field>
          </div>
          <Field label="Address" htmlFor="address">
            <input
              id="address"
              type="text"
              value={form.address || ""}
              onChange={(e) => set({ address: e.target.value })}
              placeholder="Office 704, 5EA East Wing, DAFZA"
              className={inputClass}
            />
          </Field>
          <Field label="Timezone" htmlFor="timezone">
            <input
              id="timezone"
              type="text"
              list="tz-options"
              value={form.timezone || ""}
              onChange={(e) => set({ timezone: e.target.value })}
              placeholder="Asia/Dubai"
              className={inputClass}
            />
            <datalist id="tz-options">
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz} />
              ))}
            </datalist>
          </Field>
        </Card>

        <Card
          title="Email notifications"
          description="Which workflow emails we send you. Everything else in the panel still shows up whether or not you get the email."
        >
          {/* Only shown to people the email could ever reach. A viewer with no
              blog permissions being offered a switch for "posts awaiting your
              approval" would be describing a job they do not have. */}
          {NOTIFICATION_SWITCHES.filter((n) => !n.perm || can(n.perm)).map((n) => (
            <ToggleRow
              key={n.key}
              label={n.label}
              description={n.description}
              checked={form.notifications?.[n.key] !== false}
              onChange={(checked) =>
                set({
                  notifications: { ...form.notifications, [n.key]: checked },
                })
              }
            />
          ))}

          {/* Says the quiet part out loud. Someone who switches everything off
              here and later misses a reset link would otherwise reasonably
              assume this page was the reason. */}
          <p className="flex items-start gap-2 rounded-xl border border-gray-100 bg-gray-50 p-3 text-xs text-gray-500">
            <Lock size={14} className="mt-px shrink-0" />
            Password resets, invitations and sign-in codes are always sent. They
            are how you get back into your account, so they cannot be switched
            off.
          </p>
        </Card>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving || !dirty}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#37469E] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2C3A85] disabled:opacity-60"
          >
            {saving ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Save size={15} />
            )}
            Save changes
          </button>
          {!dirty && !saving && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-400">
              <Check size={13} className="text-emerald-500" /> Up to date
            </span>
          )}
        </div>
      </form>

      <div className="mt-6">
        <PasswordCard />
      </div>
    </div>
  );
}

// Its own form, outside the profile form: a password change is a separate
// transaction with a separate endpoint, and nesting forms is invalid HTML.
function PasswordCard() {
  const toast = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await adminApi.patch("/profile/password", {
        currentPassword,
        password,
        passwordConfirm,
      });
      // Changing the password invalidates every token issued before it — this
      // session included. The server hands back a fresh pair so the tab the
      // change was made in stays signed in while other devices are logged out.
      setTokens(data.data.tokens);
      setCurrentPassword("");
      setPassword("");
      setPasswordConfirm("");
      toast.success("Password changed. You've been signed out on other devices.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change your password.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <Card
        title="Password"
        description="Changing it signs you out everywhere else."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Current password" htmlFor="currentPassword">
            <input
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="New password" htmlFor="newPassword">
            <input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Confirm new password" htmlFor="confirmPassword">
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>

        <button
          type="submit"
          disabled={busy || !currentPassword || !password}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#37469E] px-4 py-2.5 text-sm font-semibold text-[#37469E] hover:bg-[#EEF0FA] disabled:opacity-60"
        >
          {busy ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <KeyRound size={15} />
          )}
          Change password
        </button>
      </Card>
    </form>
  );
}
