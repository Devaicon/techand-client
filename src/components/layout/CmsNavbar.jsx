"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, ChevronRight, CircleArrowRight, Menu, X } from "lucide-react";
import { ICON_REGISTRY } from "@/lib/iconRegistry";
import { ADMIN_RIBBON_HEIGHT } from "@/components/layout/AdminRibbon";

// Matches the hardcoded navbar's geometry exactly, so swapping between the two
// does not shift the page under the reader.
const NAV_HEIGHT = 93;
const NAV_HEIGHT_SCROLLED = 72;

function LinkIcon({ icon, className }) {
  // Resolved by direct property access rather than through a `resolveIcon(icon)`
  // helper: the React Compiler lint rule `react-hooks/static-components` cannot
  // see through a function call and reports "Cannot create components during
  // render" — the same reason the block and control registries are indexed
  // inline everywhere else in this codebase.
  const Glyph =
    icon?.kind === "lucide" && icon.name ? ICON_REGISTRY[icon.name] : null;

  if (Glyph) return <Glyph className={className} aria-hidden="true" />;

  if (icon?.kind === "image" && icon.url) {
    return (
      <Image
        src={icon.url}
        alt=""
        width={20}
        height={20}
        className={`${className} object-contain`}
      />
    );
  }

  return null;
}

/**
 * The navigation, rendered from CMS data.
 *
 * A separate component from the hardcoded `Navbar`, not a rewrite of it. That
 * one is 1,338 lines with three bespoke dropdown implementations and its content
 * inline; grafting a data source into it would have meant rewriting all of it at
 * once, with no way back if the migrated content turned out wrong.
 *
 * `SiteChrome` picks between the two: this renders when the CMS has a menu, the
 * original renders when it does not. Once the seeded menu is verified in
 * production, the original becomes dead code and can be deleted in one commit
 * that changes nothing else.
 */
export default function CmsNavbar({ menu, hasRibbon = false }) {
  const [scrolled, setScrolled] = useState(false);
  const [openId, setOpenId] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(null);
  const closeTimer = useRef(null);

  // Shrink the navbar once the page is scrolled a little.
  useEffect(() => {
    const onScroll = () => {
      const next = window.scrollY > 20;
      setScrolled((prev) => (prev === next ? prev : next));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      setOpenId(null);
      closeMobile();
    };
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen, closeMobile]);

  // A short close delay so crossing the gap between the trigger and the panel
  // does not dismiss the menu mid-reach.
  const open = (id) => {
    clearTimeout(closeTimer.current);
    setOpenId(id);
  };
  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setOpenId(null), 150);
  };

  const ribbonOffset = hasRibbon ? ADMIN_RIBBON_HEIGHT : 0;
  const dropdownTop =
    ribbonOffset + (scrolled ? NAV_HEIGHT_SCROLLED : NAV_HEIGHT);

  const items = menu.items || [];

  return (
    <>
      <header
        className="fixed left-0 right-0 z-50 transition-all duration-300"
        style={{ top: ribbonOffset }}
      >
        <div
          className="mx-auto flex max-w-[1400px] items-center justify-between rounded-b-[30px] border-2 border-[#f2f2f2] bg-white px-6 transition-all duration-300 lg:px-14"
          style={{ height: scrolled ? NAV_HEIGHT_SCROLLED : NAV_HEIGHT }}
        >
          <Link href="/" className="shrink-0" onClick={closeMobile}>
            <Image
              src="/techand-logo.png"
              alt="Tech&"
              width={114}
              height={44}
              priority
              className={`w-auto transition-all duration-300 ${
                scrolled ? "h-9" : "h-11"
              }`}
            />
          </Link>

          {/* ── desktop menu ──────────────────────────────────────────────── */}
          <nav className="hidden items-center gap-8 lg:flex">
            {items.map((item) => {
              const hasDropdown = (item.columns || []).length > 0;

              if (!hasDropdown) {
                return (
                  <Link
                    key={item.id}
                    href={item.href || "#"}
                    className="text-base font-semibold text-[#1e1e1e] transition-colors hover:text-[#37469e]"
                  >
                    {item.title}
                  </Link>
                );
              }

              return (
                <div
                  key={item.id}
                  onMouseEnter={() => open(item.id)}
                  onMouseLeave={scheduleClose}
                >
                  <button
                    type="button"
                    onClick={() => setOpenId(openId === item.id ? null : item.id)}
                    aria-expanded={openId === item.id}
                    className="flex items-center gap-1 text-base font-semibold text-[#1e1e1e] transition-colors hover:text-[#37469e]"
                  >
                    {item.title}
                    <ChevronDown
                      size={15}
                      className={`transition-transform duration-200 ${
                        openId === item.id ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                </div>
              );
            })}
          </nav>

          <div className="hidden shrink-0 items-center gap-3 lg:flex">
            {menu.ctaLabel && menu.ctaHref && (
              <Link
                href={menu.ctaHref}
                className="flex items-center gap-2 text-base font-semibold text-[#1e1e1e] transition-colors hover:text-[#37469e]"
              >
                {menu.ctaLabel}
                <CircleArrowRight
                  size={34}
                  strokeWidth={1.5}
                  className="text-[#4a2d58]"
                  aria-hidden="true"
                />
              </Link>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="rounded-lg p-1.5 text-[#1e1e1e] lg:hidden"
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* ── desktop mega-dropdown ─────────────────────────────────────────── */}
      {items.map((item) => {
        const columns = item.columns || [];
        if (openId !== item.id || columns.length === 0) return null;

        return (
          <div
            key={item.id}
            onMouseEnter={() => open(item.id)}
            onMouseLeave={scheduleClose}
            className="fixed left-0 right-0 z-40 hidden lg:block"
            style={{ top: dropdownTop }}
          >
            <div className="mx-auto max-w-[1400px] px-6 lg:px-14">
              <div className="rounded-b-[24px] border border-t-0 border-[#f2f2f2] bg-white p-8 shadow-xl">
                <div
                  className={`grid gap-8 ${
                    columns.length > 2 ? "lg:grid-cols-3" : "lg:grid-cols-2"
                  }`}
                >
                  {columns.map((column) => (
                    <div key={column.id}>
                      <div className="mb-3 flex items-center gap-2">
                        <LinkIcon
                          icon={column.icon}
                          className="h-5 w-5 text-[#37469e]"
                        />
                        {column.href ? (
                          <Link
                            href={column.href}
                            onClick={() => setOpenId(null)}
                            className="text-[15px] font-bold text-[#0e1726] hover:text-[#37469e]"
                          >
                            {column.title}
                          </Link>
                        ) : (
                          <span className="text-[15px] font-bold text-[#0e1726]">
                            {column.title}
                          </span>
                        )}
                      </div>

                      {column.description && (
                        <p className="mb-3 text-[13px] leading-6 text-[#4a5565]">
                          {column.description}
                        </p>
                      )}

                      <ul className="space-y-1">
                        {(column.links || []).map((link) => (
                          <li key={link.id}>
                            <Link
                              href={link.href || "#"}
                              onClick={() => setOpenId(null)}
                              className="flex items-start gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-[#f6f7fb]"
                            >
                              <LinkIcon
                                icon={link.icon}
                                className="mt-0.5 h-4 w-4 shrink-0 text-[#37469e]"
                              />
                              <span className="min-w-0">
                                <span className="block text-[14px] font-medium text-[#0e1726]">
                                  {link.title}
                                </span>
                                {link.description && (
                                  <span className="block text-[12px] leading-5 text-[#8b93b8]">
                                    {link.description}
                                  </span>
                                )}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* ── mobile drawer ─────────────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeMobile}
            aria-hidden="true"
          />
          <aside className="absolute right-0 top-0 flex h-full w-[86%] max-w-sm flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <Image
                src="/techand-logo.png"
                alt="Tech&"
                width={100}
                height={38}
                className="h-9 w-auto"
              />
              <button
                onClick={closeMobile}
                aria-label="Close menu"
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
              >
                <X size={22} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-4">
              {items.map((item) => {
                const columns = item.columns || [];

                if (columns.length === 0) {
                  return (
                    <Link
                      key={item.id}
                      href={item.href || "#"}
                      onClick={closeMobile}
                      className="block rounded-lg px-3 py-3 text-[16px] font-semibold text-[#0e1726] hover:bg-gray-50"
                    >
                      {item.title}
                    </Link>
                  );
                }

                const expanded = mobileExpanded === item.id;

                return (
                  <div key={item.id}>
                    <button
                      type="button"
                      onClick={() =>
                        setMobileExpanded(expanded ? null : item.id)
                      }
                      aria-expanded={expanded}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-[16px] font-semibold text-[#0e1726] hover:bg-gray-50"
                    >
                      {item.title}
                      <ChevronRight
                        size={17}
                        className={`transition-transform duration-200 ${
                          expanded ? "rotate-90" : ""
                        }`}
                        aria-hidden="true"
                      />
                    </button>

                    {expanded && (
                      <div className="space-y-3 pb-3 pl-3">
                        {columns.map((column) => (
                          <div key={column.id}>
                            <p className="px-3 py-1 text-[12px] font-semibold uppercase tracking-wide text-[#8b93b8]">
                              {column.title}
                            </p>
                            {(column.links || []).map((link) => (
                              <Link
                                key={link.id}
                                href={link.href || "#"}
                                onClick={closeMobile}
                                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[15px] text-[#0e1726] hover:bg-gray-50"
                              >
                                <LinkIcon
                                  icon={link.icon}
                                  className="h-4 w-4 shrink-0 text-[#37469e]"
                                />
                                {link.title}
                              </Link>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {menu.ctaLabel && menu.ctaHref && (
              <div className="border-t border-gray-100 p-4">
                <Link
                  href={menu.ctaHref}
                  onClick={closeMobile}
                  className="flex h-12 items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-[#4555a7] to-[#53406b] font-semibold text-white"
                >
                  {menu.ctaLabel}
                </Link>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* The header is fixed, so the page needs its height back. */}
      <div style={{ height: scrolled ? NAV_HEIGHT_SCROLLED : NAV_HEIGHT }} />
    </>
  );
}
