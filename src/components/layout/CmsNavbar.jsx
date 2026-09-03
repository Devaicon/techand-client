"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, ChevronRight, CircleArrowRight, Menu, X } from "lucide-react";
import { ICON_REGISTRY } from "@/lib/iconRegistry";
import { ADMIN_RIBBON_HEIGHT } from "@/components/layout/AdminRibbon";
import { SUBNAV_EVENT } from "@/lib/chrome-signals";

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

/* ── dropdown presets ──────────────────────────────────────────────────────────
 *
 * The three "designs" an admin can pick per menu item. They are not three data
 * shapes: each is a different way of drawing the same `item.columns → links`
 * tree, selected by `item.layout`. Adding a fourth preset is a fourth component
 * here plus one option in `server/src/navbar/navbar.schema.js` — no data change.
 *
 * Module-level, not defined inside `CmsNavbar`: the React Compiler lint rule
 * `react-hooks/static-components` forbids creating components during render, and
 * a nested definition would remount on every parent render.
 */

// A · Link Columns — the original CMS layout: 2–3 columns of link lists.
function ColumnsBody({ item, onClose }) {
  const columns = item.columns || [];
  return (
    <div
      className={`grid gap-8 p-8 ${
        columns.length > 2 ? "lg:grid-cols-3" : "lg:grid-cols-2"
      }`}
    >
      {columns.map((column) => (
        <div key={column.id}>
          <div className="mb-3 flex items-center gap-2">
            <LinkIcon icon={column.icon} className="h-5 w-5 text-[#37469e]" />
            {column.href ? (
              <Link
                href={column.href}
                onClick={onClose}
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
                  onClick={onClose}
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
  );
}

// B · Spotlight — a rail of categories on the left; the active one's detail,
// optional sub-grid and call-to-action on the right. Revives the old Industries
// and Capabilities dropdowns. Hovering a rail row makes it active.
function SpotlightBody({ item, onClose }) {
  const columns = item.columns || [];
  const [activeIdx, setActiveIdx] = useState(0);
  const active = columns[activeIdx] || columns[0];
  const links = active?.links || [];

  return (
    <div className="flex">
      <div className="w-1/3 bg-gradient-to-br from-[#f8f9fc] to-[#eef0f7] p-5">
        <div className="space-y-1.5">
          {columns.map((column, idx) => {
            const on = idx === activeIdx;
            return (
              <button
                key={column.id}
                type="button"
                onMouseEnter={() => setActiveIdx(idx)}
                onFocus={() => setActiveIdx(idx)}
                className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[14px] transition-all ${
                  on
                    ? "border-l-4 border-[#5b6fb6] bg-white font-semibold text-[#1e1e1e] shadow-[0_10px_24px_-14px_rgba(20,24,58,0.4)]"
                    : "font-medium text-[#1e1e1e] hover:bg-white/60"
                }`}
              >
                <LinkIcon
                  icon={column.icon}
                  className="h-5 w-5 shrink-0 text-[#5b6fb6]"
                />
                <span className="flex-1">{column.title}</span>
                {on && (
                  <ChevronRight
                    size={15}
                    className="text-[#5b6fb6]"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="w-2/3 p-8">
        {active && (
          <>
            <h3 className="mb-3 text-[26px] font-bold leading-tight text-[#14183a]">
              {active.title}
            </h3>
            {active.description && (
              <p className="mb-6 max-w-[48ch] text-[14px] leading-relaxed text-[#4a5565]">
                {active.description}
              </p>
            )}
            {links.length > 0 && (
              <div className="mb-6 grid grid-cols-2 gap-x-6 gap-y-2.5">
                {links.map((link) => (
                  <Link
                    key={link.id}
                    href={link.href || "#"}
                    onClick={onClose}
                    className="flex items-center gap-2.5 rounded-lg p-2 transition-colors hover:bg-[#f6f7fb]"
                  >
                    <LinkIcon
                      icon={link.icon}
                      className="h-5 w-5 shrink-0 text-[#37469e]"
                    />
                    <span className="text-[13px] font-medium text-[#0e1726]">
                      {link.title}
                    </span>
                  </Link>
                ))}
              </div>
            )}
            {active.href && (
              <Link
                href={active.href}
                onClick={onClose}
                className="inline-flex w-fit items-center gap-2 rounded-md border-2 border-[#5b6fb6] px-5 py-2 text-[12px] font-bold uppercase tracking-wide text-[#5b6fb6] transition-colors hover:bg-[#5b6fb6] hover:text-white"
              >
                {active.ctaLabel || "Learn more"}
                <ChevronRight size={15} aria-hidden="true" />
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// C · Feature Cards — equal-weight icon cards, centered. Revives "Why Tech&".
// Column count is chosen from the card count so no card is stranded alone.
const CARD_GRID = {
  1: "grid-cols-1 max-w-xs",
  2: "grid-cols-2 max-w-2xl",
  3: "grid-cols-3 max-w-4xl",
  4: "grid-cols-4",
};
function CardsBody({ item, onClose }) {
  const cards = item.columns || [];
  const grid = CARD_GRID[Math.min(cards.length, 4)] || CARD_GRID[4];

  return (
    <div className="p-8">
      <div className={`mx-auto grid gap-5 ${grid}`}>
        {cards.map((card) => (
          <Link
            key={card.id}
            href={card.href || "#"}
            onClick={onClose}
            className="group flex flex-col items-center gap-4 rounded-2xl border-2 border-transparent p-6 text-center transition-all hover:-translate-y-0.5 hover:border-[#5b6fb6] hover:bg-gradient-to-br hover:from-[#f6f4fb] hover:to-[#eef2fc] hover:shadow-lg"
          >
            <div className="grid h-14 w-14 place-items-center rounded-full bg-[#eef0fb] text-[#37469e] transition-colors group-hover:bg-[#37469e] group-hover:text-white">
              <LinkIcon icon={card.icon} className="h-6 w-6" />
            </div>
            <div>
              <h4 className="mb-1 text-[15px] font-bold text-[#0e1726]">
                {card.title}
              </h4>
              {card.description && (
                <p className="text-[12px] leading-relaxed text-[#6b7391]">
                  {card.description}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// `item.layout` → the component that draws its dropdown. Looked up by property
// access, not a resolve() call, for the same static-components lint reason.
const DROPDOWN_BODIES = {
  columns: ColumnsBody,
  spotlight: SpotlightBody,
  cards: CardsBody,
};

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
  // A page section navigator (capabilities / what-we-do strip) hides the navbar
  // while it owns the top of the viewport, so the two never sit stacked.
  const [subnavActive, setSubnavActive] = useState(false);
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

  // Listen for a page section navigator announcing itself. When it appears we
  // slide the navbar up out of the way; when it goes (scroll back up, or leaving
  // the page) the navbar slides back down. Also drop any open dropdown so it
  // does not animate away half-open.
  useEffect(() => {
    const onSubnav = (e) => {
      const next = !!e.detail?.visible;
      setSubnavActive(next);
      if (next) setOpenId(null);
    };
    window.addEventListener(SUBNAV_EVENT, onSubnav);
    return () => window.removeEventListener(SUBNAV_EVENT, onSubnav);
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
        className={`fixed left-0 right-0 z-50 transition-all duration-300 ${
          subnavActive
            ? "pointer-events-none -translate-y-[130%] opacity-0"
            : "translate-y-0 opacity-100"
        }`}
        style={{ top: ribbonOffset }}
      >
        <div
          className={`relative mx-auto flex max-w-[1400px] items-center justify-between border-2 border-[#f2f2f2] bg-white px-6 shadow-[0_10px_30px_-12px_rgba(20,24,58,0.22)] transition-all duration-300 lg:px-14 ${
            openId ? "rounded-b-none" : "rounded-b-[30px]"
          }`}
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
                    className="flex cursor-pointer items-center gap-1 text-base font-semibold text-[#1e1e1e] transition-colors hover:text-[#37469e]"
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
            className="cursor-pointer rounded-lg p-1.5 text-[#1e1e1e] lg:hidden"
          >
            <Menu size={24} />
          </button>

          {/* Microsoft Partner plaque — hangs beneath the bar's right edge on
              its own black tile so the white-on-transparent mark stays legible.
              The top edge is flush with the bar; the bottom corners round to
              echo it. It fades out while any dropdown is open so it never sits
              over the panel. `.ms-partner-sheen` runs the shine sweep. */}
          <div
            className={`absolute right-10 top-full mt-[2px] transition-opacity duration-200 lg:right-14 ${
              openId
                ? "pointer-events-none opacity-0"
                : "opacity-100"
            }`}
          >
            <div className="ms-partner-sheen relative overflow-hidden rounded-b-lg bg-black px-4 py-2 shadow-lg ring-1 ring-white/10 sm:px-5 sm:py-3 xl:rounded-b-[16px]">
              <Image
                src="/microsoft-partner.svg"
                alt="Microsoft Partner"
                width={245}
                height={64}
                className="h-5 w-auto object-contain sm:h-6 xl:h-7"
              />
            </div>
          </div>
        </div>
      </header>

      {/* ── desktop mega-dropdown ─────────────────────────────────────────── */}
      {/* One open panel per item, its body chosen by `item.layout`. The panel
          shell — position, width, the white rounded card — is shared; only the
          inner body (and its own padding) differs per preset. */}
      {items.map((item) => {
        const columns = item.columns || [];
        if (columns.length === 0) return null;

        const Body = DROPDOWN_BODIES[item.layout] || ColumnsBody;
        const isOpen = openId === item.id;

        // Always mounted so the panel can animate OUT as well as in. `invisible`
        // takes the closed panel's links out of the tab order and `pointer-
        // events-none` stops it swallowing clicks while faded.
        return (
          <div
            key={item.id}
            onMouseEnter={() => open(item.id)}
            onMouseLeave={scheduleClose}
            className={`fixed left-0 right-0 z-40 hidden transition-all duration-200 lg:block ${
              isOpen
                ? "translate-y-0 opacity-100"
                : "pointer-events-none invisible -translate-y-2 opacity-0"
            }`}
            style={{ top: dropdownTop }}
          >
            <div className="mx-auto max-w-[1400px]">
              {/* Same max width and border weight as the bar above, and no extra
                  horizontal padding, so the panel's edges line up exactly with
                  the navbar's for every preset. */}
              <div className="overflow-hidden rounded-b-[30px] border-2 border-t-0 border-[#f2f2f2] bg-white shadow-xl">
                <Body item={item} onClose={() => setOpenId(null)} />
              </div>
            </div>
          </div>
        );
      })}

      {/* ── mobile drawer ─────────────────────────────────────────────────── */}
      {/* Always mounted so the panel slides in and out. When closed the whole
          layer is click-through (`pointer-events-none`), the scrim is faded and
          the drawer is parked off-screen to the right. */}
      <div
        className={`fixed inset-0 z-[60] lg:hidden ${
          mobileOpen ? "" : "pointer-events-none"
        }`}
        aria-hidden={!mobileOpen}
      >
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeMobile}
          aria-hidden="true"
        />
        <aside
          className={`absolute right-0 top-0 flex h-full w-[86%] max-w-sm flex-col bg-white shadow-xl transition-transform duration-300 ease-out ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
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
                className="cursor-pointer rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
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
                      className="flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-3 text-left text-[16px] font-semibold text-[#0e1726] hover:bg-gray-50"
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
                        {/* Layout-agnostic: a column with links is a titled
                            group (Columns, or a Spotlight category with a
                            sub-grid); a column with none is itself the
                            destination (a Spotlight rail row, or a card), so it
                            renders as a single tappable link rather than an
                            empty heading. */}
                        {columns.map((column) => {
                          const links = column.links || [];

                          if (links.length === 0) {
                            return (
                              <Link
                                key={column.id}
                                href={column.href || "#"}
                                onClick={closeMobile}
                                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[15px] font-medium text-[#0e1726] hover:bg-gray-50"
                              >
                                <LinkIcon
                                  icon={column.icon}
                                  className="h-4 w-4 shrink-0 text-[#37469e]"
                                />
                                {column.title}
                              </Link>
                            );
                          }

                          return (
                            <div key={column.id}>
                              <p className="px-3 py-1 text-[12px] font-semibold uppercase tracking-wide text-[#8b93b8]">
                                {column.title}
                              </p>
                              {links.map((link) => (
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
                          );
                        })}
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
    </>
  );
}
