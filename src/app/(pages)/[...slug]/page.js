import { notFound } from "next/navigation";
import { getPage } from "@/lib/pages-api";
import CmsPageView, { cmsPageMetadata } from "@/components/blocks/CmsPageView";

// Every CMS page is served from here.
//
// It sits inside the `(pages)` route group so it inherits that layout's
// SiteChrome (navbar + footer). A root-level `app/[...slug]` would match the
// same URLs but render without any chrome at all.
//
// Next.js prefers a static segment over a dynamic one, so every hand-written
// route — /insights, /capabilities, /contact-us, /admin — still wins. The
// server's reserved-slug guard is the other half of that contract: it refuses to
// create a page at a slug this route could never reach.
//
// Cached (ISR) so the CDN can serve the HTML. Each page renders on its first
// request and is then reused until an admin save purges it (see
// app/api/revalidate) or REVALIDATE_CONTENT elapses, whichever comes first.
//
// That is also why this route never reads `searchParams`: doing so makes every
// request dynamic and the response `private, no-store`. Draft links carry
// `?preview=`, and the proxy rewrites those to app/(pages)/draft-preview, which
// renders the same CmsPageView uncached.
//
// A literal because Next reads segment config statically; keep it equal to
// REVALIDATE_CONTENT in lib/cache.js.
export const revalidate = 300;

// No pages are rendered at build time — the build must not depend on the API —
// but returning a list at all is what makes unknown slugs cacheable on demand.
export async function generateStaticParams() {
  return [];
}

const slugFrom = (params) => (params?.slug || []).join("/");

export async function generateMetadata({ params }) {
  return cmsPageMetadata(await getPage(slugFrom(await params)));
}

export default async function CmsPage({ params }) {
  const data = await getPage(slugFrom(await params));

  // Draft, missing, or API down — all indistinguishable to a visitor, by
  // design. A draft page must not be detectable by the shape of its error.
  if (!data) notFound();

  return <CmsPageView data={data} />;
}
