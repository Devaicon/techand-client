"use client";

import { useState } from "react";
import {
  Eye, Loader2, Mail, PenLine, Send, ShieldCheck, X,
} from "lucide-react";
import { motion } from "motion/react";
import adminApi from "@/lib/adminApi";
import { useOverlayMotion } from "@/components/motion";

// What each role actually means, in the terms someone choosing one thinks in.
// The role names alone are not self-explanatory — "editor" in particular sounds
// like the most powerful content role, when the point of it is that an editor's
// work goes through review.
const ROLE_CARDS = [
  {
    value: "admin",
    icon: ShieldCheck,
    label: "Admin",
    blurb:
      "Full access. Publishes insights directly, approves other people's, and manages the team.",
  },
  {
    value: "editor",
    icon: PenLine,
    label: "Editor",
    blurb:
      "Writes and edits insights. Their posts go through artwork and approval before going live.",
  },
  {
    value: "viewer",
    icon: Eye,
    label: "Viewer",
    blurb: "Read-only. Can see the panel and its content but change nothing.",
  },
];

// Invitation as a modal rather than a form wedged above the members table.
// Inviting someone is an occasional, deliberate act; giving it a permanent strip
// of the page made it both the first thing you saw and the ugliest.
export default function InviteMemberDialog({ onClose, onSent }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("editor");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const backdrop = useOverlayMotion("backdrop");
  const dialog = useOverlayMotion("modal");

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await adminApi.post("/team/invites", { email: email.trim(), role });
      onSent(email.trim());
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send that invitation.");
    } finally {
      setBusy(false);
    }
  };

  return (
    // As in ImportPageDialog: the backdrop fades on its own track and the panel
    // rises and scales inside it, so it does not read as painted on the sheet.
    <motion.div
      {...backdrop}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="invite-title"
    >
      <motion.div
        {...dialog}
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="inline-flex rounded-xl bg-[#EEF0FA] p-2.5 text-[#37469E]">
              <Mail size={18} />
            </span>
            <div>
              <h2 id="invite-title" className="text-lg font-bold text-gray-900">
                Invite a team member
              </h2>
              <p className="text-sm text-gray-500">
                They&apos;ll get an email with a link to set up their account.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {error && (
              <p className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
                {error}
              </p>
            )}

            <label
              htmlFor="invite-email"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Email address
            </label>
            <input
              id="invite-email"
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="new.member@techand.ai"
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-[#37469E] focus:outline-none"
            />

            <p className="mb-2 mt-5 text-sm font-medium text-gray-700">Role</p>
            {/* Radio cards, not a select. The blurb is the whole reason this
                dialog exists — a dropdown of three words cannot say which of
                them puts someone's work through review. */}
            <div className="space-y-2">
              {ROLE_CARDS.map((r) => {
                const Icon = r.icon;
                const active = role === r.value;
                return (
                  <label
                    key={r.value}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors ${
                      active
                        ? "border-[#37469E] bg-[#EEF0FA]/60"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="invite-role"
                      value={r.value}
                      checked={active}
                      onChange={() => setRole(r.value)}
                      className="sr-only"
                    />
                    <span
                      className={`mt-0.5 inline-flex rounded-lg p-2 ${
                        active
                          ? "bg-[#37469E] text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <Icon size={15} />
                    </span>
                    <span className="min-w-0">
                      <span
                        className={`block text-sm font-semibold ${
                          active ? "text-[#37469E]" : "text-gray-800"
                        }`}
                      >
                        {r.label}
                      </span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-gray-500">
                        {r.blurb}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>

            <p className="mt-4 text-xs text-gray-500">
              The role sets their starting permissions. You can adjust any
              individual permission from the users table once they&apos;ve
              accepted.
            </p>
          </div>

          <div className="flex shrink-0 justify-end gap-2 border-t border-gray-100 bg-gray-50 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy || !email.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#37469E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2C3A85] disabled:opacity-60"
            >
              {busy ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Send size={15} />
              )}
              Send invitation
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
