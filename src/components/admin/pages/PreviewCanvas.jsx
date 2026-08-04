"use client";

import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  Loader2,
  Maximize2,
  Monitor,
  RotateCw,
  Smartphone,
  Tablet,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

export const EDIT_CHANNEL = "techand-page-editor";

// Widths chosen to match the breakpoints the blocks actually switch at
// (Tailwind's `md` and `sm`), not arbitrary device sizes — the point is to see
// the layout change, and a 390px frame is what reveals a heading that wraps
// badly on a phone.
const VIEWPORTS = [
  { id: "desktop", label: "Desktop", icon: Monitor, width: 1440 },
  { id: "tablet", label: "Tablet", icon: Tablet, width: 820 },
  { id: "mobile", label: "Mobile", icon: Smartphone, width: 390 },
];

const ZOOM_STEPS = [0.25, 0.33, 0.5, 0.67, 0.75, 1];

// The level "zoom out to see the layout" settles on when the page is too tall to
// fit even at the smallest step. Below this the page is a grey smear.
const MIN_FIT = 0.2;

/**
 * The live page, in an iframe, wired to the editor.
 *
 * Renders the real public route with the page's preview token plus `edit=1`, so
 * what the author sees is what a visitor will see — the same components, the
 * same CSS, the same server data. A re-implementation of the page inside the
 * admin panel would drift from the real one the first time a block changed.
 *
 * ## Zoom
 *
 * The iframe is laid out at the viewport's real CSS width (1440 / 820 / 390) and
 * then CSS-scaled down. Squeezing the iframe element itself would make the page
 * inside re-flow to the smaller width — which is a different layout, not a
 * smaller view of the same one, and would defeat the point of checking a desktop
 * composition.
 *
 * `ref` exposes `refresh()`, `focusBlock(id)` and `fitToPage()` so the editor can
 * drive it without reaching into the DOM itself.
 */
export default function PreviewCanvas({
  ref,
  url,
  onSelectBlock,
  onBlockContextMenu,
  selectedId,
}) {
  const frameRef = useRef(null);
  const scrollRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [viewport, setViewport] = useState("desktop");
  const [zoom, setZoom] = useState(0.5);
  const [docHeight, setDocHeight] = useState(0);

  const active = VIEWPORTS.find((v) => v.id === viewport);

  const post = useCallback((message) => {
    frameRef.current?.contentWindow?.postMessage(
      { channel: EDIT_CHANNEL, ...message },
      window.location.origin,
    );
  }, []);

  // The scale at which the whole page height fits the visible canvas.
  const computeFit = useCallback(() => {
    const box = scrollRef.current;
    if (!box || !docHeight) return null;

    const padding = 32;
    const byHeight = (box.clientHeight - padding) / docHeight;
    const byWidth = (box.clientWidth - padding) / active.width;

    return Math.max(MIN_FIT, Math.min(byHeight, byWidth, 1));
  }, [docHeight, active.width]);

  const fitToPage = useCallback(() => {
    const fit = computeFit();
    if (fit) setZoom(fit);
  }, [computeFit]);

  useImperativeHandle(
    ref,
    () => ({
      refresh: () => post({ type: "refresh" }),
      fitToPage,
      focusBlock: (id, { zoomOut = false } = {}) => {
        // Zoom first: scrolling to a block and then rescaling would land the
        // page somewhere other than where the author was told to look.
        if (zoomOut) {
          const fit = computeFit();
          // Only ever zooms OUT. An author who has deliberately zoomed in on a
          // block should not be yanked back out by clicking its row.
          if (fit) setZoom((current) => Math.min(current, Math.max(fit, 0.33)));
        }
        post({ type: "highlight", id });
        post({ type: "scrollTo", id });
      },
    }),
    [post, computeFit, fitToPage],
  );

  // Messages from the preview: it announces itself when mounted, reports its
  // rendered height, and reports clicks and right-clicks on blocks.
  useEffect(() => {
    const onMessage = (event) => {
      // Same-origin is what we expect, not what we are guaranteed.
      if (event.origin !== window.location.origin) return;
      if (event.data?.channel !== EDIT_CHANNEL) return;

      const data = event.data;

      if (data.type === "ready") setReady(true);
      if (data.type === "size") setDocHeight(data.height || 0);
      if (data.type === "select") onSelectBlock?.(data.id);

      if (data.type === "blockPosition") {
        // The iframe cannot scroll itself — it is laid out at the page's full
        // height so the whole thing can be zoomed — so the canvas container is
        // what moves. The block's offset arrives in the page's own unscaled
        // coordinates and has to be multiplied by the zoom actually applied.
        //
        // Read from the DOM rather than from `zoom`: `focusBlock` may have just
        // changed the zoom, and this listener's closure holds whatever the value
        // was when it was registered. The rendered frame is the authority on how
        // large it currently is.
        const box = scrollRef.current;
        const frame = frameRef.current;
        if (!box || !frame) return;

        const scale = frame.getBoundingClientRect().width / active.width;
        box.scrollTo({
          top: Math.max(0, data.top * scale - 24),
          behavior: "smooth",
        });
      }

      if (data.type === "contextmenu") {
        // The iframe reports coordinates in its own unscaled viewport. Convert
        // to page coordinates: the frame's offset on screen, plus the click
        // position multiplied by the scale actually applied to it.
        const rect = frameRef.current?.getBoundingClientRect();
        if (!rect) return;
        onBlockContextMenu?.(data.id, rect.left + data.x * zoom, rect.top + data.y * zoom);
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [onSelectBlock, onBlockContextMenu, zoom, active.width]);

  // Re-assert the highlight whenever selection changes, and after a refresh —
  // `router.refresh()` in the iframe re-renders the tree and drops the
  // attribute the bridge had set.
  useEffect(() => {
    if (ready && selectedId) post({ type: "highlight", id: selectedId });
  }, [ready, selectedId, post]);

  // Ask for a fresh measurement when the frame is swapped to another width: the
  // page reflows and its height changes with it.
  useEffect(() => {
    if (ready) post({ type: "measure" });
  }, [ready, viewport, post]);

  // Two strengths of reload, one button.
  //
  // A plain click asks the preview to re-render itself, which is what the editor
  // already does after every write and keeps the scroll position. Shift-click
  // remounts the iframe outright — the escape hatch for when the bridge has
  // stopped answering, which the soft path cannot fix by definition.
  const [reloadKey, setReloadKey] = useState(0);

  const reload = (hard) => {
    if (hard || !ready) {
      setReady(false);
      setDocHeight(0);
      setReloadKey((n) => n + 1);
      return;
    }
    post({ type: "refresh" });
    post({ type: "measure" });
  };

  const step = (direction) => {
    setZoom((current) => {
      const index = ZOOM_STEPS.findIndex((z) => z >= current - 0.001);
      const next = index + direction;
      return ZOOM_STEPS[Math.max(0, Math.min(ZOOM_STEPS.length - 1, next))];
    });
  };

  return (
    <div className="flex h-full min-h-[32rem] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-[#eceef3]">
      <div className="flex items-center justify-between gap-2 border-b border-gray-200 bg-white px-3 py-2">
        <span className="hidden truncate text-xs text-gray-500 sm:block">
          Click a block to edit it · right-click for more
        </span>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={(e) => reload(e.shiftKey)}
            title="Reload the preview — hold Shift for a full reload"
            aria-label="Reload the preview"
            className="rounded-lg bg-gray-100 p-2 text-gray-500 hover:text-gray-700"
          >
            <RotateCw size={15} className={ready ? "" : "animate-spin"} />
          </button>

          {/* zoom */}
          <div className="flex items-center gap-0.5 rounded-lg bg-gray-100 p-0.5">
            <button
              type="button"
              onClick={() => step(-1)}
              title="Zoom out"
              className="rounded-md p-1.5 text-gray-500 hover:text-gray-700"
            >
              <ZoomOut size={15} />
            </button>
            <span className="w-11 text-center text-[11px] font-semibold tabular-nums text-gray-600">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => step(1)}
              title="Zoom in"
              className="rounded-md p-1.5 text-gray-500 hover:text-gray-700"
            >
              <ZoomIn size={15} />
            </button>
            <button
              type="button"
              onClick={fitToPage}
              title="Fit whole page"
              className="rounded-md p-1.5 text-gray-500 hover:text-gray-700"
            >
              <Maximize2 size={14} />
            </button>
          </div>

          {/* viewport */}
          <div className="flex items-center gap-0.5 rounded-lg bg-gray-100 p-0.5">
            {VIEWPORTS.map((v) => {
              const Icon = v.icon;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setViewport(v.id)}
                  title={v.label}
                  aria-pressed={viewport === v.id}
                  className={`rounded-md p-1.5 ${
                    viewport === v.id
                      ? "bg-white text-[#37469E] shadow-sm"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <Icon size={15} />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="relative flex-1 overflow-auto p-4">
        {!ready && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#eceef3]">
            <Loader2 className="animate-spin text-[#37469E]" />
          </div>
        )}

        {/* The outer box occupies the SCALED size, so the scroll area is the size
            of what you can actually see. Without it the container would still
            reserve the frame's full unscaled 1440×N and leave a large empty
            region to scroll through. */}
        <div
          className="mx-auto"
          style={{
            width: active.width * zoom,
            height: docHeight ? docHeight * zoom : "100%",
          }}
        >
          <iframe
            // Keyed so a hard reload remounts the element. Re-assigning `src`
            // to the same URL is a no-op in some browsers, which is exactly the
            // case this button exists for.
            key={reloadKey}
            ref={frameRef}
            src={url}
            title="Page preview"
            className="rounded-lg border border-gray-200 bg-white shadow-sm"
            style={{
              width: active.width,
              height: docHeight || "100%",
              transform: `scale(${zoom})`,
              transformOrigin: "top left",
            }}
          />
        </div>
      </div>
    </div>
  );
}
