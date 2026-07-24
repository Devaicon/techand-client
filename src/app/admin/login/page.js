"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Send, LogIn, Loader2 } from "lucide-react";
import adminApi from "@/lib/adminApi";

const inputCls =
  "block w-full rounded-xl border-0 bg-white py-3 px-4 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#4555A7] sm:text-sm";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1: credentials, 2: OTP
  const [challengeId, setChallengeId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const apiError = (err) =>
    err.response?.data?.message || err.message || "Something went wrong";

  const handleCredentials = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await adminApi.post("/auth/login", { email, password });
      setChallengeId(data.data.challengeId);
      setStep(2);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await adminApi.post("/auth/mfa", { challengeId, code: otp });
      router.push("/admin");
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F6F7FB] px-6 py-12">
      <div className="grid w-full max-w-4xl items-center gap-10 md:grid-cols-2 md:gap-0">
        <div className="text-center md:border-r md:border-gray-200 md:pr-14 md:text-left lg:pr-20">
          <Image
            src="/techand-logo.png"
            alt="Tech&"
            width={150}
            height={59}
            priority
            className="mx-auto md:mx-0"
          />
          <h1 className="mt-8 text-3xl font-bold tracking-tight text-gray-900">
            Admin Panel
          </h1>
          <p className="mt-3 leading-relaxed text-gray-500">
            Sign in with your admin email and password. We&apos;ll send a
            one-time passcode to finish signing in.
          </p>
        </div>

        <div className="md:pl-14 lg:pl-20">
          {error && (
            <div className="mb-6 rounded-xl bg-rose-50 p-4 text-sm text-rose-700 ring-1 ring-rose-200">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form className="space-y-5" onSubmit={handleCredentials}>
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={inputCls}
                  placeholder="you@techand.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className={inputCls}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#37469E] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#2C3A85] disabled:opacity-60"
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" />Sending passcode…</>
                ) : (
                  <><Send size={16} />Continue</>
                )}
              </button>
            </form>
          ) : (
            <form className="space-y-5" onSubmit={handleVerifyOtp}>
              <div>
                <label htmlFor="otp" className="mb-2 block text-sm font-medium text-gray-700">
                  One-time passcode
                </label>
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                  className={`${inputCls} text-center text-lg tracking-[0.4em]`}
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  disabled={loading}
                />
                <p className="mt-2 text-xs text-gray-400">
                  Sent to {email}. The code expires in 10 minutes.
                </p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#37469E] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#2C3A85] disabled:opacity-60"
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" />Verifying…</>
                ) : (
                  <><LogIn size={16} />Verify &amp; sign in</>
                )}
              </button>
              <button
                type="button"
                onClick={() => { setStep(1); setOtp(""); setError(""); }}
                className="mx-auto flex items-center gap-1.5 text-sm font-medium text-[#37469E] hover:text-[#2C3A85]"
              >
                <ArrowLeft size={15} />Use different credentials
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
