"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, MailCheck, Send } from "lucide-react";
import adminApi from "@/lib/adminApi";
import AuthShell, {
  authButtonClass,
  authInputClass,
} from "@/components/admin/AuthShell";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await adminApi.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      // The endpoint answers 200 whether or not the address exists, so reaching
      // here means the request itself failed — network, rate limit, or a
      // malformed address — not "no such user".
      setError(
        err.response?.data?.message ||
          "Could not send the reset email. Try again in a moment.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Forgot your password?"
      blurb="Enter the email address on your admin account and we'll send you a link to choose a new password."
    >
      {error && (
        <div className="mb-6 rounded-xl bg-rose-50 p-4 text-sm text-rose-700 ring-1 ring-rose-200">
          {error}
        </div>
      )}

      {sent ? (
        // Deliberately does not confirm the address exists — saying "no account
        // with that email" here would turn this form into a way to enumerate
        // who is on the team.
        <div className="space-y-5">
          <div className="flex items-start gap-3 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800 ring-1 ring-emerald-200">
            <MailCheck size={18} className="mt-px shrink-0" />
            <div>
              <p className="font-semibold">Check your inbox</p>
              <p className="mt-1">
                If an account exists for <strong>{email}</strong>, a reset link is
                on its way. It expires in one hour.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSent(false)}
            className="text-sm font-medium text-[#37469E] hover:text-[#2C3A85]"
          >
            Use a different email address
          </button>
          <Link
            href="/admin/login"
            className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft size={15} /> Back to sign in
          </Link>
        </div>
      ) : (
        <form className="space-y-5" onSubmit={submit}>
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              className={authInputClass}
              placeholder="you@techand.ai"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <button type="submit" disabled={loading} className={authButtonClass}>
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Sending…
              </>
            ) : (
              <>
                <Send size={16} />
                Send reset link
              </>
            )}
          </button>
          <Link
            href="/admin/login"
            className="mx-auto flex w-fit items-center gap-1.5 text-sm font-medium text-[#37469E] hover:text-[#2C3A85]"
          >
            <ArrowLeft size={15} /> Back to sign in
          </Link>
        </form>
      )}
    </AuthShell>
  );
}
