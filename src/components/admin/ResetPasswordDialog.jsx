"use client";

import { useState } from "react";
import { KeyRound, Loader2, Mail, RefreshCw, X } from "lucide-react";
import adminApi from "@/lib/adminApi";
import { displayName } from "./UserAvatar";

// Generated rather than typed: an administrator inventing a temporary password
// under time pressure invents a weak one, and this value is going to travel
// over chat before it is changed.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
const generatePassword = (length = 16) => {
  const bytes = new Uint32Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (n) => ALPHABET[n % ALPHABET.length]).join("");
};

export default function ResetPasswordDialog({ member, onClose, onDone }) {
  const [mode, setMode] = useState("link");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  // Held after a successful temporary reset so the admin can copy it — this is
  // the only place the value is ever shown, and it is gone on close.
  const [issued, setIssued] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const { data } = await adminApi.post(
        `/users/${member.id}/reset-password`,
        mode === "temporary" ? { mode, password } : { mode },
      );
      if (mode === "temporary") {
        setIssued(password);
      } else {
        onDone(data.data.message);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset the password.");
    } finally {
      setBusy(false);
    }
  };

  const who = displayName(member);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Reset password</h2>
            <p className="mt-0.5 text-sm text-gray-500">
              {who} · {member.email}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {issued ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-900">
                Temporary password set
              </p>
              <p className="mt-1 text-sm text-amber-800">
                Give this to {who} directly. It is deliberately not in the email
                they just received, and this is the last time it will be shown.
              </p>
              <code className="mt-3 block select-all break-all rounded-lg border border-amber-200 bg-white px-3 py-2 font-mono text-sm text-gray-900">
                {issued}
              </code>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => navigator.clipboard?.writeText(issued)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Copy
              </button>
              <button
                type="button"
                onClick={() => {
                  onDone(`A temporary password was set for ${who}.`);
                  onClose();
                }}
                className="rounded-lg bg-[#37469E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2C3A85]"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            {error && (
              <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
                {error}
              </p>
            )}

            <label
              className={`flex cursor-pointer gap-3 rounded-xl border p-4 ${
                mode === "link"
                  ? "border-[#37469E] bg-[#EEF0FA]"
                  : "border-gray-200"
              }`}
            >
              <input
                type="radio"
                name="mode"
                value="link"
                checked={mode === "link"}
                onChange={() => setMode("link")}
                className="mt-1 accent-[#37469E]"
              />
              <span>
                <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
                  <Mail size={14} /> Email them a reset link
                </span>
                <span className="mt-1 block text-sm text-gray-600">
                  They choose the new password themselves and you never see it.
                  The link expires in one hour.
                </span>
              </span>
            </label>

            <label
              className={`flex cursor-pointer gap-3 rounded-xl border p-4 ${
                mode === "temporary"
                  ? "border-[#37469E] bg-[#EEF0FA]"
                  : "border-gray-200"
              }`}
            >
              <input
                type="radio"
                name="mode"
                value="temporary"
                checked={mode === "temporary"}
                onChange={() => {
                  setMode("temporary");
                  if (!password) setPassword(generatePassword());
                }}
                className="mt-1 accent-[#37469E]"
              />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
                  <KeyRound size={14} /> Set a temporary password
                </span>
                <span className="mt-1 block text-sm text-gray-600">
                  For when they cannot reach their email. You relay it to them
                  yourself, and they should change it straight away.
                </span>

                {mode === "temporary" && (
                  <span className="mt-3 flex gap-2">
                    <input
                      type="text"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      minLength={8}
                      required
                      placeholder="At least 8 characters"
                      className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2 font-mono text-sm focus:border-[#37469E] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setPassword(generatePassword())}
                      title="Generate a new one"
                      className="rounded-lg border border-gray-200 px-3 py-2 text-gray-500 hover:text-[#37469E]"
                    >
                      <RefreshCw size={15} />
                    </button>
                  </span>
                )}
              </span>
            </label>

            <p className="text-xs text-gray-500">
              Either way, {who} is signed out on every device once the reset
              completes.
            </p>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#37469E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2C3A85] disabled:opacity-60"
              >
                {busy && <Loader2 size={15} className="animate-spin" />}
                {mode === "link" ? "Send reset link" : "Set password"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
