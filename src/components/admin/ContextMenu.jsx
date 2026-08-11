"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useIsPresent } from "motion/react";
import { useOverlayMotion } from "@/components/motion";

/**
 * Right-click menus for the admin panel.
 *
 * One provider near the root owns the open menu; any component calls
 * `useContextMenu()` and gets an `open(event, items)` function. That shape,
 * rather than a `<ContextMenuTrigger>` wrapper per call site, is what lets the
 * preview iframe raise a menu too: the iframe has no React tree of ours to wrap,
 * it just posts coordinates, and the editor calls `openAt(x, y, items)`.
 *
 * An item is:
 *
 *   { label, icon?, onSelect, disabled?, danger?, shortcut?, hint? }
 *   { separator: true }
 *   { heading: "Move" }
 *
 * Items may be a plain array or a function returning one, so a call site can
 * build the menu from state at the moment of the click rather than on every
 * render.
 */

const ContextMenuContext = createContext(null);

export function useContextMenu() {
  const ctx = useContext(ContextMenuContext);
  if (!ctx) {
    throw new Error("useContextMenu must be used inside <ContextMenuProvider>");
  }
  return ctx;
}

// Menus are positioned from the pointer, then nudged back inside the viewport.
// Measured after mount rather than estimated from item count: a menu with hints
// and headings is not a predictable multiple of a row height.
//
// `offsetWidth`/`offsetHeight`, NOT `getBoundingClientRect()`. The menu now
// animates in from `scale: 0.96`, and Motion writes that transform as an inline
// style on the first render — before this measurement runs. A bounding rect
// reflects transforms, so it would report a menu 4% smaller than the one about
// to be on screen and clamp it a few pixels past the viewport edge. The offset
// dimensions are pre-transform layout values and stay correct mid-animation.
const clampToViewport = (x, y, el) => {
  const { innerWidth, innerHeight } = window;
  const width = el.offsetWidth;
  const height = el.offsetHeight;
  const margin = 8;

  // Flipping above the pointer rather than clamping to the bottom edge: a menu
  // pinned to the bottom of the screen covers the row that opened it.
  const flipped = y + height + margin > innerHeight;

  return {
    left: Math.max(margin, Math.min(x, innerWidth - width - margin)),
    top: flipped ? Math.max(margin, y - height) : y,
    // Reported so the scale-in can grow from whichever corner the menu is
    // actually pinned by. Growing from the centre while anchored at one corner
    // reads as the menu sliding rather than opening.
    flipped,
  };
};

const isSelectable = (item) => item && !item.separator && !item.heading && !item.disabled;

function Menu({ x, y, items, onClose }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ left: x, top: y, ready: false });
  const [activeIndex, setActiveIndex] = useState(-1);
  const menuMotion = useOverlayMotion("menu");
  // False for the ~120ms a dismissed menu spends fading out. It is still
  // mounted for that time, and without this its document-level listeners would
  // outlive it: right-click A, right-click B, and the first click afterwards
  // reaches A's dismiss handler, which closes B. Everything below is gated on
  // it so a leaving menu is inert.
  const isPresent = useIsPresent();

  // Position before paint, so the menu never appears at the raw pointer
  // coordinates and then jumps once it has been measured.
  useLayoutEffect(() => {
    if (!ref.current) return;
    setPos({ ...clampToViewport(x, y, ref.current), ready: true });
  }, [x, y]);

  useEffect(() => {
    if (!isPresent) return undefined;

    const onPointerDown = (event) => {
      if (!ref.current?.contains(event.target)) onClose();
    };
    // Any scroll, resize or focus change means the anchor has probably moved,
    // and a menu floating away from what it acts on is worse than no menu.
    const onDismiss = () => onClose();

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }

      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const step = event.key === "ArrowDown" ? 1 : -1;
        setActiveIndex((current) => {
          let next = current;
          for (let i = 0; i < items.length; i += 1) {
            next = (next + step + items.length) % items.length;
            if (isSelectable(items[next])) return next;
          }
          return current;
        });
        return;
      }

      if (event.key === "Enter" || event.key === " ") {
        const item = items[activeIndex];
        if (isSelectable(item)) {
          event.preventDefault();
          onClose();
          item.onSelect?.();
        }
      }
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("resize", onDismiss);
    window.addEventListener("blur", onDismiss);
    // Capture phase: a scroll inside any container should dismiss, not just one
    // that bubbles to window.
    document.addEventListener("scroll", onDismiss, true);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("resize", onDismiss);
      window.removeEventListener("blur", onDismiss);
      document.removeEventListener("scroll", onDismiss, true);
    };
  }, [items, activeIndex, onClose, isPresent]);

  return (
    <motion.div
      {...menuMotion}
      ref={ref}
      role="menu"
      className="fixed z-[100] min-w-[13rem] max-w-[18rem] overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-2xl"
      style={{
        left: pos.left,
        top: pos.top,
        // Hidden for the one frame between mount and measurement.
        visibility: pos.ready ? "visible" : "hidden",
        // Anchored to the corner the menu actually hangs from, so it opens
        // outward from the pointer instead of appearing to drift.
        transformOrigin: pos.flipped ? "bottom left" : "top left",
        // A fading menu must not swallow the click that dismissed it, nor any
        // click aimed at what is now underneath it.
        pointerEvents: isPresent ? undefined : "none",
      }}
    >
      {items.map((item, index) => {
        if (item.separator) {
          return (
            <div
              key={`sep-${index}`}
              role="separator"
              className="my-1 border-t border-gray-100"
            />
          );
        }

        if (item.heading) {
          return (
            <p
              key={`head-${index}`}
              className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400"
            >
              {item.heading}
            </p>
          );
        }

        const Icon = item.icon;

        return (
          <button
            key={item.label}
            type="button"
            role="menuitem"
            disabled={item.disabled}
            onMouseEnter={() => setActiveIndex(index)}
            onClick={() => {
              onClose();
              item.onSelect?.();
            }}
            className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm disabled:cursor-not-allowed disabled:opacity-40 ${
              item.danger
                ? "text-rose-600 hover:bg-rose-50"
                : "text-gray-700 hover:bg-gray-50"
            } ${activeIndex === index && !item.disabled ? (item.danger ? "bg-rose-50" : "bg-gray-50") : ""}`}
          >
            {Icon ? (
              <Icon size={15} className="shrink-0" />
            ) : (
              <span className="w-[15px] shrink-0" />
            )}

            <span className="min-w-0 flex-1">
              <span className="block truncate">{item.label}</span>
              {item.hint && (
                <span className="block truncate text-xs text-gray-400">
                  {item.hint}
                </span>
              )}
            </span>

            {item.shortcut && (
              <span className="shrink-0 text-[11px] font-medium text-gray-400">
                {item.shortcut}
              </span>
            )}
          </button>
        );
      })}
    </motion.div>
  );
}

export function ContextMenuProvider({ children }) {
  const [menu, setMenu] = useState(null);
  // The portal has to outlive the menu inside it, or the fade-out has nothing
  // to play in — React would rip the whole subtree out on close and
  // `AnimatePresence` would never see the child leave. So the portal opens on
  // the first menu and then stays, holding an empty `AnimatePresence`.
  //
  // This preserves the original SSR argument: `opened` starts false and is only
  // set from a pointer event, so `createPortal` is still unreachable during the
  // server render by construction rather than by a `mounted` guard.
  const [opened, setOpened] = useState(false);

  const close = useCallback(() => setMenu(null), []);

  const openAt = useCallback((x, y, items) => {
    const resolved = typeof items === "function" ? items() : items;
    if (!resolved?.length) return;
    setOpened(true);
    setMenu({ x, y, items: resolved });
  }, []);

  const open = useCallback(
    (event, items) => {
      event.preventDefault();
      // Without this a right-click inside a row would also open any menu
      // registered on an ancestor, and the two would stack.
      event.stopPropagation();
      openAt(event.clientX, event.clientY, items);
    },
    [openAt],
  );

  const value = useMemo(() => ({ open, openAt, close }), [open, openAt, close]);

  return (
    <ContextMenuContext.Provider value={value}>
      {children}
      {opened &&
        createPortal(
          <AnimatePresence>
            {menu && (
              // Keyed on the coordinates: right-clicking somewhere else while a
              // menu is open is a new menu, and it should re-run its opening
              // animation from the new anchor rather than slide across.
              <Menu
                key={`${menu.x},${menu.y}`}
                x={menu.x}
                y={menu.y}
                items={menu.items}
                onClose={close}
              />
            )}
          </AnimatePresence>,
          document.body,
        )}
    </ContextMenuContext.Provider>
  );
}
