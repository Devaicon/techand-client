"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, KeyRound, Loader2 } from "lucide-react";
import adminApi from "@/lib/adminApi";
import AuthShell, {
  authButtonClass,
  authInputClass,
} from "@/components/admin/AuthShell";

function ResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("The two passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await adminApi.post("/auth/reset-password", { token, password });
      setDone(true);
      // The reset does not sign anyone in — MFA still has to happen — so this
      // lands on the login screen rather than the dashboard.
      setTimeout(() => router.push("/admin/login"), 2500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "That reset link is invalid or has expired.",
      );
    } finally {
      setLoading(false);
    }
  };

  // A link that arrived without its token cannot be recovered from — say so
  // rather than showing a form that is guaranteed to fail on submit.
  if (!token) {
    return (
      <AuthShell
        title="Reset link incomplete"
        blurb="This page needs the token from your reset email."
      >
        <div className="space-y-5">
          <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800 ring-1 ring-amber-200">
            The link you followed is missing its token. Copy it straight from the
            email, or request a fresh one.
          </div>
          <Link
            href="/admin/forgot-password"
            className={authButtonClass}
          >
            Request a new link
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Choose a new password"
      blurb="Pick something at least 8 characters long that you don't use anywhere else."
    >
      {error && (
        <div className="mb-6 rounded-xl bg-rose-50 p-4 text-sm text-rose-700 ring-1 ring-rose-200">
          {error}
        </div>
      )}

      {done ? (
        <div className="space-y-5">
          <div className="flex items-start gap-3 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800 ring-1 ring-emerald-200">
            <CheckCircle2 size={18} className="mt-px shrink-0" />
            <div>
              <p className="font-semibold">Password updated</p>
              <p className="mt-1">
                Taking you to the sign-in page — use your new password from here
                on.
              </p>
            </div>
          </div>
          <Link
            href="/admin/login"
            className="flex items-center gap-1.5 text-sm font-medium text-[#37469E] hover:text-[#2C3A85]"
          >
            <ArrowLeft size={15} /> Go to sign in now
          </Link>
        </div>
      ) : (
        <form className="space-y-5" onSubmit={submit}>
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              New password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              className={authInputClass}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <label
              htmlFor="confirm"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Confirm new password
            </label>
            <input
              id="confirm"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              className={authInputClass}
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              disabled={loading}
            />
          </div>
          <button type="submit" disabled={loading} className={authButtonClass}>
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Updating…
              </>
            ) : (
              <>
                <KeyRound size={16} />
                Set new password
              </>
            )}
          </button>
          <Link
            href="/admin/login"
            className="mx-auto flex w-fit items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft size={15} /> Back to sign in
          </Link>
        </form>
      )}
    </AuthShell>
  );
}

// useSearchParams needs a Suspense boundary, or the whole route opts out of
// static rendering with a build-time warning.
export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#F6F7FB]">
          <Loader2 className="animate-spin text-[#37469E]" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
