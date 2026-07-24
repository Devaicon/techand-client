"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Loader2, UserCheck } from "lucide-react";
import adminApi from "@/lib/adminApi";

const inputCls =
  "block w-full rounded-xl border-0 bg-white py-3 px-4 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#4555A7] sm:text-sm";

function AcceptForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") || "";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await adminApi.post("/invite/accept", { token, username, password });
      setDone(true);
      setTimeout(() => router.push("/admin/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Could not accept invite");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return <p className="text-center text-rose-600">Missing invitation token.</p>;
  }
  if (done) {
    return (
      <div className="text-center">
        <UserCheck className="mx-auto mb-3 text-emerald-600" size={32} />
        <p className="font-medium text-gray-900">Account created! Redirecting to sign in…</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {error && <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700 ring-1 ring-rose-200">{error}</div>}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Username</label>
        <input className={inputCls} required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="yourname" disabled={loading} />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Password</label>
        <input type="password" className={inputCls} required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" disabled={loading} />
      </div>
      <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#37469E] px-4 py-3 text-sm font-semibold text-white hover:bg-[#2C3A85] disabled:opacity-60">
        {loading ? <><Loader2 size={16} className="animate-spin" />Creating account…</> : "Accept invitation"}
      </button>
    </form>
  );
}

export default function InviteAcceptPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F6F7FB] px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Image src="/techand-logo.png" alt="Tech&" width={140} height={55} priority className="mx-auto" />
          <h1 className="mt-6 text-2xl font-bold text-gray-900">Accept your invitation</h1>
          <p className="mt-2 text-sm text-gray-500">Set up your account to join the team.</p>
        </div>
        <Suspense fallback={<Loader2 className="mx-auto animate-spin text-[#37469E]" />}>
          <AcceptForm />
        </Suspense>
      </div>
    </div>
  );
}
