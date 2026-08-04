import { notFound } from "next/navigation";
import { getPage } from "@/lib/pages-api";
import BlockRenderer from "@/components/blocks/BlockRenderer";
import EditModeBridge from "@/components/blocks/EditModeBridge";

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
// Rendered on every request so publishing a page, editing a block or reordering
// the list is reflected immediately rather than served from a build-time
// snapshot. `getPage` is uncached to match.
export const dynamic = "force-dynamic";

const slugFrom = (params) => (params?.slug || []).join("/");

export async function generateMetadata({ params, searchParams }) {
  const { preview } = (await searchParams) || {};
  const data = await getPage(slugFrom(await params), preview);

  if (!data) return {};

  const { page } = data;
  return {
    title: page.metaTitle || `${page.title} | Tech&`,
    description: page.metaDescription || page.subtitle || undefined,
    // A draft is only reachable by token, but a reviewer might still paste the
    // preview URL somewhere a crawler can see it.
    robots: data.isPreview ? { index: false, follow: false } : undefined,
  };
}

export default async function CmsPage({ params, searchParams }) {
  const { preview, edit } = (await searchParams) || {};
  const data = await getPage(slugFrom(await params), preview);

  // Draft, missing, or API down — all indistinguishable to a visitor, by
  // design. A draft page must not be detectable by the shape of its error.
  if (!data) notFound();

  const { sections, isPreview } = data;

  // Editor scaffolding is gated on a VALID preview token, not on `edit=1`
  // alone. `isPreview` is only true once the server matched the token, so an
  // anonymous visitor appending `?edit=1` to a live URL gets the ordinary page —
  // there is nothing to opt into.
  const editable = isPreview && edit === "1";

  return (
    <main>
      {/* The banner is suppressed inside the editor: it would sit at the top of
          the preview canvas describing something the author already knows, and
          push the real first block out of view. */}
      {isPreview && !editable && (
        <p className="bg-amber-500 px-4 py-2 text-center text-sm font-semibold text-white">
          Draft preview — this page is not published and is only visible with
          this link.
        </p>
      )}

      {editable && <EditModeBridge />}

      {/* The whole page body, including its header, is assembled in the admin
          panel. Only the navbar and footer above and below are code. */}
      <BlockRenderer sections={sections} editable={editable} />
    </main>
  );
}
