"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// The preview iframe's half of the editor's two-way link.
//
// Only mounted when the page is rendered with `?edit=1` AND a valid preview
// token — so it never ships to a visitor, and a URL with `edit=1` but no token
// is just a 404 like any other draft request.
//
// Parent and iframe are the same origin (both are this Next app), so
// postMessage is available without any CORS work. Every listener still checks
// `event.origin`: same-origin is what we expect, not what we are guaranteed —
// any page that embeds this one could otherwise drive the editor.

export const EDIT_CHANNEL = "techand-page-editor";

const applyHighlight = (id) => {
  for (const el of document.querySelectorAll("[data-block-id]")) {
    el.toggleAttribute("data-block-selected", el.dataset.blockId === id);
  }
};

export default function EditModeBridge() {
  const router = useRouter();

  // Which block the editor has selected. Held in a ref because the outline is
  // set imperatively on the DOM, and the `router.refresh()` below re-renders
  // the tree it was set on.
  const highlightRef = useRef(null);

  // Re-asserted after every render, which is what makes the outline survive a
  // refresh. Auto-save refreshes the preview each time it lands, and a block
  // that lost its outline every second and a bit while its own heading was
  // being typed would read as a bug.
  useEffect(() => {
    if (highlightRef.current) applyHighlight(highlightRef.current);
  });

  useEffect(() => {
    const post = (message) =>
      window.parent?.postMessage(
        { channel: EDIT_CHANNEL, ...message },
        window.location.origin,
      );

    // How tall the rendered page is, so the editor can compute a zoom level that
    // fits the whole thing on screen. Reported rather than measured from the
    // parent because the parent cannot read into the iframe's layout without
    // reaching across the document boundary.
    const postHeight = () =>
      post({
        type: "size",
        height: document.documentElement.scrollHeight,
        width: document.documentElement.scrollWidth,
      });

    // Clicking a block in the preview selects it in the editor. Capture phase,
    // because a block's own links and buttons would otherwise swallow the click
    // before it reached us.
    const onClick = (event) => {
      const host = event.target.closest?.("[data-block-id]");
      if (!host) return;

      // The preview is for editing, not for browsing — following a link would
      // navigate the iframe away from the page being edited.
      event.preventDefault();
      event.stopPropagation();
      post({ type: "select", id: host.dataset.blockId });
    };

    // Right-clicking a block raises the editor's context menu over it. The
    // coordinates are relative to the iframe's viewport; the parent adds the
    // iframe's own offset and its zoom factor, which are facts only it knows.
    const onContextMenu = (event) => {
      const host = event.target.closest?.("[data-block-id]");
      if (!host) return;

      event.preventDefault();
      event.stopPropagation();
      post({
        type: "contextmenu",
        id: host.dataset.blockId,
        x: event.clientX,
        y: event.clientY,
      });
    };

    const onMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.channel !== EDIT_CHANNEL) return;

      const { type, id } = event.data;

      if (type === "refresh") {
        // A soft refetch rather than location.reload(): the scroll position
        // survives, so saving a block near the bottom of a long page does not
        // throw the author back to the top.
        router.refresh();
        return;
      }

      if (type === "measure") {
        postHeight();
        return;
      }

      if (type === "scrollTo") {
        const host = document.querySelector(`[data-block-id="${id}"]`);
        if (!host) return;

        // Reported back rather than scrolled here. The editor sizes this iframe
        // to the page's full height so it can zoom the whole thing, which leaves
        // the iframe with nothing to scroll — `scrollIntoView` would be a no-op.
        // The element that actually scrolls is the editor's canvas container,
        // and only the parent can move it.
        post({
          type: "blockPosition",
          id,
          top: host.getBoundingClientRect().top + window.scrollY,
          height: host.offsetHeight,
        });
      }

      if (type === "highlight") {
        highlightRef.current = id;
        applyHighlight(id);
      }
    };

    document.addEventListener("click", onClick, true);
    document.addEventListener("contextmenu", onContextMenu, true);
    window.addEventListener("message", onMessage);

    // Images and fonts land after mount and change the page's height, so the
    // first measurement is almost always wrong. An observer keeps the editor's
    // fit-to-page zoom honest without polling.
    const observer = new ResizeObserver(postHeight);
    observer.observe(document.documentElement);

    post({ type: "ready" });
    postHeight();

    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("contextmenu", onContextMenu, true);
      window.removeEventListener("message", onMessage);
      observer.disconnect();
    };
  }, [router]);

  return (
    <style>{`
      [data-block-id] { position: relative; cursor: pointer; }
      [data-block-id]::after {
        content: "";
        position: absolute;
        inset: 0;
        pointer-events: none;
        outline: 2px solid transparent;
        outline-offset: -2px;
        transition: outline-color .15s, background-color .15s;
      }
      [data-block-id]:hover::after { outline-color: #37469e80; }
      [data-block-selected]::after {
        outline-color: #37469e;
        background: #37469e0d;
      }
    `}</style>
  );
}
