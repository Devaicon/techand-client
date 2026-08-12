"use client";

/**
 * Loading placeholders.
 *
 * These fill the gap between an admin page mounting and its fetch resolving.
 * That gap was previously empty space followed by a hard pop-in, which reads as
 * a page that was broken and then suddenly was not — a skeleton turns the same
 * wait into something that was always loading. It also stops the layout jumping
 * when content lands, because the placeholder occupies roughly the space the
 * real thing will.
 *
 * ## Why the shimmer is CSS and not Motion
 *
 * Everything else in this module is Motion, but a skeleton animates
 * indefinitely and there may be a dozen on screen. Motion would run a
 * JavaScript loop per element for as long as the fetch takes; the CSS
 * animation in globals.css (`.skeleton`) is handed to the compositor and costs
 * essentially nothing while it runs. Reduced motion is handled there too — the
 * sweep stops and the bar stays a flat grey block.
 *
 * A skeleton must never outlive its data. Render it only while loading:
 *
 *   {loading ? <SkeletonRows count={5} /> : <Stagger>…</Stagger>}
 */

/**
 * One shimmering bar. Everything else here is built from it.
 *
 * `aria-hidden` throughout: the shape is a visual stand-in with no content to
 * announce. The *fact* of loading should be conveyed by the container — an
 * `aria-busy="true"` on the region, or a live region saying so — not by a
 * screen reader walking a dozen empty boxes.
 */
export function Skeleton({ className = "", ...rest }) {
  return (
    <span
      aria-hidden="true"
      className={`skeleton block rounded-md ${className}`}
      {...rest}
    />
  );
}

/**
 * A paragraph's worth of lines. The last is short, because a real one is —
 * a stack of equal-length bars reads as a table, not as prose.
 */
export function SkeletonText({ lines = 3, className = "" }) {
  return (
    <span className={`block space-y-2 ${className}`}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          className={`h-3 ${i === lines - 1 ? "w-2/3" : "w-full"}`}
        />
      ))}
    </span>
  );
}

/**
 * Stand-in for the stat tiles and content cards used across the panel. The
 * wrapper carries the same rounding, border and padding as the real card so
 * the swap does not move anything.
 */
export function SkeletonCard({ className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={`rounded-2xl border border-gray-100 bg-white p-6 shadow-sm ${className}`}
    >
      <Skeleton className="mb-4 h-11 w-11 rounded-xl" />
      <Skeleton className="mb-2 h-7 w-16" />
      <Skeleton className="h-3 w-24" />
    </div>
  );
}

/**
 * Stand-in for a list or table body: an icon or thumbnail, two lines of text,
 * and a trailing control.
 */
export function SkeletonRows({ count = 4, className = "" }) {
  return (
    <div aria-hidden="true" className={`divide-y divide-gray-100 ${className}`}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex items-center gap-4 py-4">
          <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-20 shrink-0 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export default Skeleton;
