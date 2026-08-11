"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { GripHorizontal, Minus, X } from "lucide-react";
import { useInteraction, useOverlayMotion } from "@/components/motion";

/**
 * A draggable, resizable window that floats over the editor canvas.
 *
 * The blocks list and page settings live in these rather than in a column beside
 * the preview: the preview is the thing being worked on and wants the whole
 * width, and a panel the author can shove aside is worth more than a fixed
 * column that permanently costs 26rem.
 *
 * Position and size are remembered per `id` in localStorage, because a window
 * that resets every time the page reloads is a window you have to re-arrange
 * every time.
 *
 * Dragging and resizing use pointer events directly rather than dnd-kit. dnd-kit
 * models dropping something onto something else; this is free movement in a
 * plane, where a drop target is meaningless.
 *
 * The panel floats over a full-page preview iframe, which is what makes the drag
 * more careful than it looks. An iframe is a separate document: once the pointer
 * crosses into it, the parent stops receiving `pointermove` and never sees the
 * `pointerup`. A drag written against `document` listeners freezes mid-gesture,
 * jumps when the pointer comes back, and stays stuck in drag mode because the
 * release was delivered somewhere else. Two things prevent that — pointer
 * capture, which routes the whole gesture to the element that started it, and a
 * shield over the viewport for the duration, so the iframe never gets a look in.
 */

const STORAGE_PREFIX = "techand.panel.";

const loadState = (id) => {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + id);
    return raw ? JSON.parse(raw) : null;
  } catch {
    // Private mode, quota, or a value someone hand-edited. A panel that opens in
    // its default place is fine; one that throws on mount is not.
    return null;
  }
};

const saveState = (id, state) => {
  try {
    localStorage.setItem(STORAGE_PREFIX + id, JSON.stringify(state));
  } catch {
    /* not worth surfacing */
  }
};

// Keep at least this much of the header on screen, so a panel dragged to an edge
// can always be dragged back.
const KEEP_VISIBLE = 80;

const clamp = (rect) => ({
  ...rect,
  x: Math.min(
    Math.max(rect.x, -(rect.width - KEEP_VISIBLE)),
    window.innerWidth - KEEP_VISIBLE,
  ),
  y: Math.min(Math.max(rect.y, 0), window.innerHeight - 44),
});

// Edge and corner handles. `mode` is a compass string, and each letter in it is
// one axis the drag affects — so "se" is just "s" and "e" applied together and
// needs no special case in the maths below.
const HANDLES = [
  { mode: "n", className: "left-2 right-2 top-0 h-1.5 cursor-ns-resize" },
  { mode: "s", className: "bottom-0 left-2 right-2 h-1.5 cursor-ns-resize" },
  { mode: "w", className: "bottom-2 left-0 top-2 w-1.5 cursor-ew-resize" },
  { mode: "e", className: "bottom-2 right-0 top-2 w-1.5 cursor-ew-resize" },
  { mode: "nw", className: "left-0 top-0 h-3 w-3 cursor-nwse-resize" },
  { mode: "ne", className: "right-0 top-0 h-3 w-3 cursor-nesw-resize" },
  { mode: "sw", className: "bottom-0 left-0 h-3 w-3 cursor-nesw-resize" },
  { mode: "se", className: "bottom-0 right-0 h-3 w-3 cursor-nwse-resize" },
];

// While minimised the body is hidden and the height is auto, so only the two
// width handles mean anything.
const WIDTH_ONLY = new Set(["w", "e"]);

export default function FloatingPanel({
  id,
  title,
  subtitle,
  icon: Icon,
  defaultRect,
  minWidth = 260,
  minHeight = 160,
  onClose,
  children,
}) {
  // Restored in a lazy initialiser, not an effect.
  //
  // Safe despite localStorage being browser-only: a panel is only rendered once
  // the editor has loaded its page over the network, so it is never part of the
  // server render and there is no HTML for a restored position to disagree
  // with. Doing it in an effect would mean the panel visibly jumps from its
  // default position to its saved one on every open.
  const [saved] = useState(() =>
    typeof window === "undefined" ? null : loadState(id),
  );
  const [rect, setRect] = useState(() =>
    saved?.rect ? { ...defaultRect, ...saved.rect } : defaultRect,
  );
  const [minimised, setMinimised] = useState(() => Boolean(saved?.minimised));
  const [dragMode, setDragMode] = useState(null);

  const enter = useOverlayMotion("panel");
  const iconPress = useInteraction("icon");

  // Written on a timer, not on every frame. A drag produces a rect change per
  // pointermove, and `localStorage.setItem` is synchronous — persisting each one
  // put a JSON encode and a disk write on the critical path of every frame,
  // which is most of what made dragging feel heavy.
  useEffect(() => {
    const timer = setTimeout(() => saveState(id, { rect, minimised }), 250);
    return () => clearTimeout(timer);
  }, [id, rect, minimised]);

  // A restored position from a larger window may be off-screen entirely. Pulled
  // back once on mount, and again whenever the window is resized.
  useEffect(() => {
    const onResize = () => setRect((r) => clamp(r));
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // The gesture's starting point. A ref, not state: it is read inside pointer
  // handlers and must never be a render behind the pointer.
  const originRef = useRef(null);
  const frameRef = useRef(0);

  const startDrag = useCallback(
    (event, mode) => {
      // Ignore anything but the primary button: a right-click on the header
      // should reach the context menu, not begin a drag.
      if (event.button !== 0) return;
      event.preventDefault();
      event.stopPropagation();

      // Capture routes every later move and the release to this element, whatever
      // the pointer happens to be over — including the preview iframe, which
      // would otherwise eat both and leave the panel stuck mid-drag.
      event.currentTarget.setPointerCapture?.(event.pointerId);

      originRef.current = {
        pointerX: event.clientX,
        pointerY: event.clientY,
        ...rect,
      };
      setDragMode(mode);
    },
    [rect],
  );

  const onDragMove = useCallback(
    (event) => {
      const origin = originRef.current;
      if (!origin || !dragMode) return;

      const { clientX, clientY } = event;

      // One update per frame. Pointer events fire faster than the browser
      // paints, and every extra `setRect` is a full re-render of the panel and
      // its contents that will never be shown.
      cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(() => {
        const dx = clientX - origin.pointerX;
        const dy = clientY - origin.pointerY;

        if (dragMode === "move") {
          setRect(
            clamp({
              width: origin.width,
              height: origin.height,
              x: origin.x + dx,
              y: origin.y + dy,
            }),
          );
          return;
        }

        let { x, y, width, height } = origin;

        if (dragMode.includes("e")) width = Math.max(minWidth, origin.width + dx);
        if (dragMode.includes("s")) height = Math.max(minHeight, origin.height + dy);

        // Dragging a left or top edge changes the size AND the origin. `x` moves
        // by however much the width ACTUALLY changed rather than by `dx`, so
        // once the panel hits its minimum the opposite edge stays put instead of
        // the whole panel sliding away under the pointer.
        if (dragMode.includes("w")) {
          width = Math.max(minWidth, origin.width - dx);
          x = origin.x + (origin.width - width);
        }
        if (dragMode.includes("n")) {
          height = Math.max(minHeight, origin.height - dy);
          y = origin.y + (origin.height - height);
        }

        setRect({ x, y, width, height });
      });
    },
    [dragMode, minWidth, minHeight],
  );

  // `pointercancel` matters as much as `pointerup`: the browser fires it when it
  // takes the gesture over for a scroll or a system gesture, and a drag that
  // only listens for the release stays live forever after one of those.
  const endDrag = useCallback((event) => {
    cancelAnimationFrame(frameRef.current);
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    originRef.current = null;
    setDragMode(null);
  }, []);

  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  const dragHandlers = {
    onPointerMove: onDragMove,
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
  };

  return (
    <>
      {/* A transparent sheet over everything for the length of the gesture. It
          keeps the pointer out of the preview iframe, holds one cursor for the
          whole drag instead of whatever is under it, and means no text
          selection to suppress on `document.body`. */}
      {dragMode && (
        <div
          aria-hidden="true"
          // Above the preview canvas (z-10), below the panel itself and below
          // the inspector drawer (z-40) — a shield that outranked those would
          // be a new bug in place of the old one.
          className="fixed inset-0 z-20"
          style={{
            cursor: dragMode === "move" ? "grabbing" : `${dragMode}-resize`,
          }}
        />
      )}

      <motion.section
        {...enter}
        // Only opacity and scale are animated. Position is `left`/`top` driven
        // by the pointer, and height changes when the panel is minimised —
        // handing either to Motion would put an animation between the author's
        // hand and the window they are dragging, which is the one place lag is
        // unforgivable. The entrance is a transform, so it settles to identity
        // and never touches the drag maths.
        aria-label={title}
        className="pointer-events-auto fixed z-30 flex flex-col rounded-xl border border-gray-200 bg-white shadow-2xl"
        style={{
          left: rect.x,
          top: rect.y,
          width: rect.width,
          height: minimised ? undefined : rect.height,
        }}
      >
      <header
        onPointerDown={(e) => startDrag(e, "move")}
        {...dragHandlers}
        onDoubleClick={() => setMinimised((v) => !v)}
        className="flex touch-none select-none items-center gap-2 rounded-t-xl border-b border-gray-100 bg-gray-50 px-3 py-2"
        style={{ cursor: dragMode === "move" ? "grabbing" : "grab" }}
      >
        <GripHorizontal size={14} className="shrink-0 text-gray-300" />
        {Icon && <Icon size={14} className="shrink-0 text-[#37469E]" />}

        <span className="min-w-0 flex-1">
          <span className="block truncate text-xs font-semibold text-gray-700">
            {title}
          </span>
          {subtitle && !minimised && (
            <span className="block truncate text-[11px] text-gray-400">
              {subtitle}
            </span>
          )}
        </span>

        <motion.button
          {...iconPress}
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => setMinimised((v) => !v)}
          aria-label={minimised ? "Expand panel" : "Minimise panel"}
          className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
        >
          <Minus size={13} />
        </motion.button>
        <motion.button
          {...iconPress}
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={onClose}
          aria-label="Close panel"
          className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
        >
          <X size={13} />
        </motion.button>
      </header>

      {!minimised && (
        <div
          className={`min-h-0 flex-1 overflow-y-auto rounded-b-xl ${
            dragMode ? "select-none" : ""
          }`}
        >
          {children}
        </div>
      )}

      {HANDLES.filter((h) => !minimised || WIDTH_ONLY.has(h.mode)).map((h) => (
        <span
          key={h.mode}
          role="presentation"
          onPointerDown={(e) => startDrag(e, h.mode)}
          {...dragHandlers}
          className={`absolute z-10 touch-none ${h.className}`}
        />
      ))}

      {/* The conventional corner grip. Purely a visual cue — the handle above it
          is what listens. */}
      {!minimised && (
        <span className="pointer-events-none absolute bottom-[3px] right-[3px] block h-2 w-2 border-b-2 border-r-2 border-gray-300" />
      )}
      </motion.section>
    </>
  );
}
