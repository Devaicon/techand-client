import BlockRenderer from "@/components/blocks/BlockRenderer";
import EditModeBridge from "@/components/blocks/EditModeBridge";
import JsonLd from "@/components/seo/JsonLd";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import { SITE_URL } from "@/lib/constants";
import { resolveCanonical } from "@/lib/canonicalUrl.mjs";
import { buildFaqSchema, faqItemsFromSections } from "@/lib/structuredData.mjs";

// A CMS page, shared by the two routes that render one: the cached public route
// (app/(pages)/[...slug]) and the uncached draft route (app/(pages)/draft-preview)
// that `?preview=` links are rewritten to. Keeping both on this one component is
// what guarantees a preview looks exactly like the page it will become.

/**
 * Metadata for a page returned by `getPage`.
 * @param {{page: object, isPreview: boolean}|null} data
 */
export function cmsPageMetadata(data) {
  if (!data) return {};

  const { page } = data;
  const metaTitle = page.metaTitle?.trim();
  const description = page.metaDescription?.trim() || page.subtitle || undefined;
  const keywords = page.metaKeywords?.length ? page.metaKeywords : undefined;
  // Canonicalise to the page's own URL — `page.slug` is the full path with no
  // leading slash. Without this the page inherits the root layout's homepage
  // canonical. An explicit override wins when set — moved onto the www origin if
  // it names this site under the redirecting bare host.
  const canonical = resolveCanonical(page.canonicalUrl, `/${page.slug}`, SITE_URL);

  return {
    // A meta title is used verbatim (`absolute`); otherwise the page title runs
    // through the root layout's `%s | Tech&` template so the brand is appended
    // exactly once. The old `page.metaTitle || \`${page.title} | Tech&\`` fallback
    // double-branded, since the template also ran on the resulting string.
    title: metaTitle ? { absolute: metaTitle } : page.title,
    description,
    keywords,
    alternates: { canonical },
    // A draft is only reachable by token, but a reviewer might still paste the
    // preview URL somewhere a crawler can see it.
    robots: data.isPreview ? { index: false, follow: false } : undefined,
  };
}

/**
 * @param {{data: {page: object, sections: object[], isPreview: boolean}, edit?: string}} props
 */
export default function CmsPageView({ data, edit }) {
  const { page, sections, isPreview } = data;

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

      {/* Structured data for the live page only — a draft must not advertise
          itself to crawlers. The FAQPage is built from the page's own FAQ
          accordion blocks, so it can only ever describe answers a visitor can
          actually open on this page. */}
      {!isPreview && (
        <>
          <BreadcrumbSchema path={`/${page.slug}`} currentLabel={page.title} />
          <JsonLd schema={buildFaqSchema(faqItemsFromSections(sections))} />
        </>
      )}

      {/* The whole page body, including its header, is assembled in the admin
          panel. Only the navbar and footer above and below are code. */}
      <BlockRenderer sections={sections} editable={editable} />
    </main>
  );
}
