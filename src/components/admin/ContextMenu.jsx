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
const clampToViewport = (x, y, el) => {
  const { innerWidth, innerHeight } = window;
  const rect = el.getBoundingClientRect();
  const margin = 8;

  return {
    left: Math.max(margin, Math.min(x, innerWidth - rect.width - margin)),
    // Flipping above the pointer rather than clamping to the bottom edge: a menu
    // pinned to the bottom of the screen covers the row that opened it.
    top:
      y + rect.height + margin > innerHeight
        ? Math.max(margin, y - rect.height)
        : y,
  };
};

const isSelectable = (item) => item && !item.separator && !item.heading && !item.disabled;

function Menu({ x, y, items, onClose }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ left: x, top: y, ready: false });
  const [activeIndex, setActiveIndex] = useState(-1);

  // Position before paint, so the menu never appears at the raw pointer
  // coordinates and then jumps once it has been measured.
  useLayoutEffect(() => {
    if (!ref.current) return;
    setPos({ ...clampToViewport(x, y, ref.current), ready: true });
  }, [x, y]);

  useEffect(() => {
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
  }, [items, activeIndex, onClose]);

  return (
    <div
      ref={ref}
      role="menu"
      className="fixed z-[100] min-w-[13rem] max-w-[18rem] overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-2xl"
      style={{
        left: pos.left,
        top: pos.top,
        // Hidden for the one frame between mount and measurement.
        visibility: pos.ready ? "visible" : "hidden",
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
    </div>
  );
}

export function ContextMenuProvider({ children }) {
  const [menu, setMenu] = useState(null);

  // No `mounted` flag is needed to keep the portal off the server render:
  // `menu` is null until a pointer event sets it, and pointer events only
  // happen in a browser. So `createPortal` is unreachable during SSR by
  // construction rather than by a guard.
  const close = useCallback(() => setMenu(null), []);

  const openAt = useCallback((x, y, items) => {
    const resolved = typeof items === "function" ? items() : items;
    if (!resolved?.length) return;
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
      {menu &&
        createPortal(
          <Menu x={menu.x} y={menu.y} items={menu.items} onClose={close} />,
          document.body,
        )}
    </ContextMenuContext.Provider>
  );
}
