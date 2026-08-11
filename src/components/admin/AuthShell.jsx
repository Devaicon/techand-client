"use client";

import Image from "next/image";

// The split-panel frame the signed-out screens share: login, forgot password
// and reset password. Extracted so the three cannot drift into three slightly
// different logins, which is what makes a password screen feel like a phishing
// page.
export default function AuthShell({ title, blurb, children }) {
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
            {title}
          </h1>
          <p className="mt-3 leading-relaxed text-gray-500">{blurb}</p>
        </div>

        <div className="md:pl-14 lg:pl-20">{children}</div>
      </div>
    </div>
  );
}

export const authInputClass =
  "block w-full rounded-xl border-0 bg-white py-3 px-4 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#4555A7] sm:text-sm";

export const authButtonClass =
  "flex w-full items-center justify-center gap-2 rounded-xl bg-[#37469E] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#2C3A85] disabled:opacity-60";
