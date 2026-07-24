"use client";

import { ExternalLink } from "lucide-react";

// Height of the ribbon in px — SiteChrome and Navbar offset themselves by this
// so the ribbon sits above the (fixed) marketing navbar without overlap.
export const ADMIN_RIBBON_HEIGHT = 40;

const labelRole = (r) => (r || "").replace(/_/g, " ").toUpperCase();

// Thin dark bar shown at the very top of the public site while an admin is
// signed in, offering a one-click hop back to the dashboard.
export default function AdminRibbon({ user }) {
  if (!user) return null;

  return (
    <div
      style={{ height: ADMIN_RIBBON_HEIGHT }}
      className="fixed inset-x-0 top-0 z-[55] flex items-center justify-center gap-3 bg-[#2B3352] px-4 text-xs text-gray-100 sm:text-sm"
    >
      <span className="truncate">
        Signed in as <span className="font-semibold">{user.username}</span>
        <span className="hidden text-gray-300 sm:inline"> · {labelRole(user.role)}</span>
      </span>
      <a
        href="/admin"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 font-medium text-white transition-colors hover:bg-white/20"
      >
        Go to Dashboard
        <ExternalLink size={14} />
      </a>
    </div>
  );
}
