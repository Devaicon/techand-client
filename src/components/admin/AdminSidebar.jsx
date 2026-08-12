"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Files, Menu as MenuIcon, PanelLeftClose, PanelLeftOpen, Users, LogOut, Menu, X, ExternalLink, FileText, ShieldCheck, Images } from "lucide-react";
import { useAdminAuth } from "@/app/admin/AdminAuthProvider";
import { useBlogQueues } from "@/app/admin/BlogQueuesProvider";
import { labelRole } from "@/components/admin/PermissionEditor";
import UserAvatar, { displayName } from "@/components/admin/UserAvatar";

// Brand mark shown in the sidebar / drawer / mobile top bar headers.
function Logo({ className = "" }) {
  return (
    <Image
      src="/techand-logo.png"
      alt="Tech& Admin"
      width={104}
      height={41}
      priority
      className={`h-auto w-auto ${className}`}
    />
  );
}

// Public-site landing for the "View website" button, by role:
// admins land on Home, content roles (editor/viewer) on Insights.
const websiteHrefFor = (role) =>
  ["editor", "viewer"].includes(role) ? "/insights" : "/";

// `badge` asks SidebarInner to hang a queue count off the entry — a queue
// nobody can see the depth of is a queue that gets forgotten. Artwork sits
// directly above Approvals because that is the order a post passes through them.
//
// Users covers what used to be two entries: it holds the member table AND
// invitations, which were never really separate jobs.
const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, perm: null },
  { href: "/admin/blogs", label: "Insights", icon: FileText, perm: "blog:read" },
  { href: "/admin/artwork", label: "Artwork", icon: Images, perm: "blog:illustrate", badge: "artwork" },
  { href: "/admin/approvals", label: "Approvals", icon: ShieldCheck, perm: "blog:approve", badge: "approvals" },
  { href: "/admin/pages", label: "Pages", icon: Files, perm: "pages:read" },
  { href: "/admin/navbar", label: "Navigation", icon: MenuIcon, perm: "navbar:manage" },
  { href: "/admin/users", label: "Users", icon: Users, perm: "users:read" },
];

// Remembered across sessions: an author who works mostly in the page editor
// wants the rail every time, not once.
const COLLAPSE_KEY = "techand.admin.sidebarCollapsed";

// Nav links + user/sign-out footer, shared by the desktop sidebar and the
// mobile drawer. `onNavigate` lets the mobile drawer close itself on tap.
// `collapsed` renders the icon-only rail; the mobile drawer never collapses,
// since it is already an explicit overlay.
function SidebarInner({
  items, pathname, user, logout, onNavigate, collapsed, counts,
}) {
  const websiteHref = websiteHrefFor(user?.role);
  const countFor = (item) => (item.badge ? counts[item.badge] || 0 : 0);
  // Each stage keeps the colour it wears everywhere else, so a glance at the
  // rail says which stage is backed up without reading the labels.
  const badgeTone = (item) =>
    item.badge === "artwork"
      ? { dot: "bg-violet-500", pill: "bg-violet-100 text-violet-700" }
      : { dot: "bg-amber-500", pill: "bg-amber-100 text-amber-700" };

  if (collapsed) {
    return (
      <>
        <nav className="flex-1 space-y-1 px-2">
          {items.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            const count = countFor(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={count ? `${item.label} (${count})` : item.label}
                aria-label={count ? `${item.label}, ${count} waiting` : item.label}
                className={`relative flex justify-center rounded-lg p-2.5 transition-colors ${
                  active
                    ? "bg-[#37469E] text-white"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                <Icon size={18} />
                {count > 0 && (
                  <span
                    className={`absolute right-1 top-1 min-w-[1.1rem] rounded-full px-1 text-[10px] font-bold leading-[1.1rem] text-white ${badgeTone(item).dot}`}
                  >
                    {count > 9 ? "9+" : count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-1 border-t border-gray-200 p-2">
          <Link
            href="/admin/profile"
            title="Your profile"
            aria-label="Your profile"
            className={`flex justify-center rounded-lg p-1.5 transition-colors ${
              pathname.startsWith("/admin/profile")
                ? "bg-[#EEF0FA]"
                : "hover:bg-gray-100"
            }`}
          >
            <UserAvatar user={user} size="sm" />
          </Link>
          <a
            href={websiteHref}
            target="_blank"
            rel="noopener noreferrer"
            title="View website"
            aria-label="View website"
            className="flex justify-center rounded-lg p-2.5 text-gray-500 hover:bg-gray-100"
          >
            <ExternalLink size={17} />
          </a>
          <button
            onClick={logout}
            title="Sign out"
            aria-label="Sign out"
            className="flex w-full justify-center rounded-lg p-2.5 text-gray-500 hover:bg-gray-100"
          >
            <LogOut size={17} />
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <nav className="flex-1 space-y-1 px-3">
        {items.map((item) => {
          // Sub-pages keep their section highlighted (/admin/blogs/new lights
          // up "Insights"). Overview is exact-match, or it would match every
          // route under /admin.
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          const count = countFor(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-[#37469E] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Icon size={18} />
              {item.label}
              {count > 0 && (
                <span
                  aria-label={`${count} waiting`}
                  className={`ml-auto rounded-full px-2 py-0.5 text-xs font-bold ${
                    active ? "bg-white/20 text-white" : badgeTone(item).pill
                  }`}
                >
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-gray-200 p-4">
        {/* The whole block is the way into the profile page — the account
            summary and "manage my account" are the same affordance everywhere
            else, and a separate nav row for it would just be a second one. */}
        <Link
          href="/admin/profile"
          onClick={onNavigate}
          className={`mb-2 flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors ${
            pathname.startsWith("/admin/profile")
              ? "bg-[#EEF0FA]"
              : "hover:bg-gray-100"
          }`}
        >
          <UserAvatar user={user} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-900">
              {displayName(user)}
            </p>
            <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-[#EEF0FA] px-2 py-0.5 text-[11px] font-medium text-[#37469E]">
              {labelRole(user?.role)}
            </span>
          </div>
        </Link>
        <a
          href={websiteHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onNavigate}
          className="mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
        >
          <ExternalLink size={16} />View website
        </a>
        <button
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
        >
          <LogOut size={16} />Sign out
        </button>
      </div>
    </>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, can, logout } = useAdminAuth();
  const { approvalCount, artworkCount } = useBlogQueues();
  const counts = { approvals: approvalCount, artwork: artworkCount };
  const [open, setOpen] = useState(false);

  // Read once in a lazy initialiser rather than in an effect.
  //
  // Safe despite localStorage being browser-only: the dashboard layout's `Guard`
  // renders a spinner until the admin session has loaded, so this component is
  // never part of the server render and there is no HTML for a client value to
  // disagree with. An effect would also work, but setting state from an effect
  // body is a cascading render the React Compiler rightly complains about.
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem(COLLAPSE_KEY) === "1";
    } catch {
      // Private mode or a blocked store — the expanded default is fine.
      return false;
    }
  });

  const toggleCollapsed = () => {
    setCollapsed((current) => {
      const next = !current;
      try {
        localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      } catch {
        /* not worth surfacing */
      }
      return next;
    });
  };

  const items = NAV.filter((i) => !i.perm || can(i.perm));

  return (
    <>
      {/* Mobile top bar (hidden on lg+) */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <Logo className="max-h-7" />
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Admin</span>
        </div>
        <button
          onClick={() => setOpen(true)}
          aria-label="Open navigation menu"
          className="rounded-lg p-1.5 text-gray-600 hover:bg-gray-100"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Desktop static sidebar. Collapses to an icon rail, which is what gives
          the page editor's preview canvas back ~12rem of width. */}
      <aside
        className={`relative hidden flex-shrink-0 flex-col border-r border-gray-200 bg-white transition-[width] duration-200 lg:flex ${
          collapsed ? "w-[4.5rem]" : "w-64"
        }`}
      >
        {collapsed ? (
          <div className="flex justify-center px-2 py-6">
            {/* Sized by width, not height. The wordmark is 2.55:1, so in a
                4.5rem rail the width is the binding constraint: `h-8` computed
                an 82px width for a 56px box, and Tailwind's `img { max-width:
                100% }` took the difference out of the letters rather than the
                height. Declaring 40x40 for a 1030x403 file compounded it with a
                square pre-load ratio. */}
            <Image
              src="/techand-logo.png"
              alt="Tech& Admin"
              width={112}
              height={44}
              priority
              className="h-auto w-14"
            />
          </div>
        ) : (
          <div className="px-6 py-6">
            <Logo />
            <p className="mt-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
              Admin Panel
            </p>
          </div>
        )}

        <SidebarInner
          items={items}
          pathname={pathname}
          user={user}
          logout={logout}
          collapsed={collapsed}
          counts={counts}
        />

        {/* On the border rather than inside the rail: at 4.5rem wide there is no
            room for a control that is not a nav item, and a tab on the edge is
            the convention for this. */}
        <button
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute -right-3 top-7 z-10 rounded-full border border-gray-200 bg-white p-1 text-gray-400 shadow-sm hover:text-[#37469E]"
        >
          {collapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
        </button>
      </aside>

      {/* Mobile off-canvas drawer + backdrop */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute left-0 top-0 flex h-full w-64 max-w-[80%] flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div className="flex items-center gap-2">
                <Logo className="max-h-7" />
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Admin</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close navigation menu"
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <SidebarInner
              items={items}
              pathname={pathname}
              user={user}
              logout={logout}
              onNavigate={() => setOpen(false)}
              counts={counts}
            />
          </aside>
        </div>
      )}
    </>
  );
}
