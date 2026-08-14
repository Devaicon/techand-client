"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ChevronRight } from "lucide-react";
import { buildBreadcrumbTrail } from "@/lib/buildBreadcrumbTrail.mjs";

/**
 * Breadcrumb
 * Renders a breadcrumb trail derived from the current pathname. Sits inside the
 * page hero (over the gradient), so its text is styled light. Renders nothing on
 * the homepage and top-level pages — it only appears on nested sub-pages such as
 * /capabilities/data or /whatwedo/ai-automation.
 *
 * @param {Object} props
 * @param {string} [props.currentLabel] - Overrides the label of the final
 *   (current-page) crumb. Use it when the URL slug isn't a good label — e.g. a
 *   blog post, where we want the real title instead of the slug.
 */
export default function Breadcrumb({ currentLabel }) {
  const pathname = usePathname();
  const trail = buildBreadcrumbTrail(pathname);

  if (trail.length === 0) return null;

  const crumbs = currentLabel
    ? trail.map((crumb, index) =>
        index === trail.length - 1 ? { ...crumb, label: currentLabel } : crumb,
      )
    : trail;

  return (
    <nav aria-label="Breadcrumb" className="mb-3 sm:mb-4">
      {/* Deliberately quiet on small screens. The last crumb repeats the h1
          directly below it (a post title, a page name), so the trail has to
          read as chrome rather than compete with the heading. */}
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-white/80 sm:text-sm">
        {crumbs.map((crumb, index) => (
          <li key={crumb.href} className="flex items-center gap-x-1.5">
            {index > 0 && (
              <ChevronRight
                className="w-4 h-4 text-white/50 shrink-0"
                aria-hidden="true"
              />
            )}
            {crumb.isCurrent ? (
              <span className="font-medium text-white/90" aria-current="page">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                {/* {index === 0 && (
                  <Home className="w-4 h-4 shrink-0" aria-hidden="true" />
                )} */}
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
