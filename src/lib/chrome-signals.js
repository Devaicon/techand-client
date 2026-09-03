// A page-level section navigator (e.g. the capabilities/what-we-do sticky strip)
// takes over the top of the viewport while it is on screen, and asks the site
// navbar to slide out of its way. Kept as a DOM CustomEvent so the two
// components stay fully decoupled — they live far apart in the tree and neither
// needs a reference to the other.
export const SUBNAV_EVENT = "site:subnav-visibility";

// `visible` is whether a page section navigator is currently covering the top.
export function emitSubnavVisibility(visible) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(SUBNAV_EVENT, { detail: { visible: !!visible } }),
  );
}
