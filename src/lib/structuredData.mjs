// The site-wide schema.org documents — Organization, WebSite, BreadcrumbList and
// FAQPage — as pure functions of their inputs.
//
// Kept beside buildArticleSchema for the same reason: what a crawler reads is
// decided here, and every rule below is testable without rendering a page.
// `siteUrl` is passed in rather than imported so `node --test` can load this
// file with no bundler to resolve the `@/` alias.

import { buildBreadcrumbTrail, SEGMENT_LABELS } from "./buildBreadcrumbTrail.mjs";

const trimBase = (siteUrl) => String(siteUrl || "").replace(/\/+$/, "");

// Stable node ids. The Organization is declared once, in the root layout, and
// every other document points at it by @id instead of restating a second,
// slightly different publisher — which is how a validator ends up reporting two
// organisations with conflicting logos.
export const organizationId = (siteUrl) => `${trimBase(siteUrl)}/#organization`;
export const websiteId = (siteUrl) => `${trimBase(siteUrl)}/#website`;

// A raster file that exists. The previous document pointed at /logo.webp, which
// 404s — and an Organization whose logo cannot be fetched is reported as
// invalid, not merely incomplete. 500x500 clears Google's 112px minimum.
export const LOGO_PATH = "/logo1.png";

export function buildOrganizationSchema({ siteUrl }) {
  const base = trimBase(siteUrl);
  const logo = `${base}${LOGO_PATH}`;

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": organizationId(base),
    name: "Tech&",
    alternateName: "Techand",
    url: base,
    logo: {
      "@type": "ImageObject",
      "@id": `${base}/#logo`,
      url: logo,
      contentUrl: logo,
      width: 500,
      height: 500,
      caption: "Tech&",
    },
    image: { "@id": `${base}/#logo` },
    description:
      "Microsoft Dynamics 365, AI and enterprise automation partner for the UAE & GCC region.",
    email: "contact@techand.ai",
    telephone: "+971507020541",
    address: {
      "@type": "PostalAddress",
      streetAddress:
        "Office 704, 7th Floor, 5EA Building (East Wing), Dubai Airport Freezone Authority (DAFZA)",
      addressLocality: "Dubai",
      addressRegion: "Dubai",
      addressCountry: "AE",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      telephone: "+971507020541",
      email: "contact@techand.ai",
      areaServed: ["AE", "SA", "QA", "KW", "BH", "OM"],
      availableLanguage: ["en", "ar"],
    },
    // Only profiles that resolve. The old list carried "https://twitter.com/Tech&",
    // which is not a valid handle and is flagged as a malformed sameAs URL.
    sameAs: ["https://www.linkedin.com/company/techand.ai/"],
    areaServed: [
      { "@type": "Country", name: "United Arab Emirates" },
      { "@type": "Place", name: "GCC Region" },
    ],
    knowsAbout: [
      "Microsoft Dynamics 365",
      "Dynamics 365 Business Central",
      "Dynamics 365 Finance and Operations",
      "Enterprise Automation",
      "Digital Transformation",
      "Artificial Intelligence",
    ],
  };
}

export function buildWebSiteSchema({ siteUrl }) {
  const base = trimBase(siteUrl);
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": websiteId(base),
    url: base,
    name: "Tech&",
    inLanguage: "en",
    publisher: { "@id": organizationId(base) },
  };
}

// Labels for top-level pages that only ever appear in the schema trail. The
// visible breadcrumb hides itself below two segments, so these never needed an
// entry in SEGMENT_LABELS — but a BreadcrumbList for "/whywith-techand" should
// still say "Why Tech&", not "Whywith Techand".
const TOP_LEVEL_LABELS = {
  "whywith-techand": "Why Tech&",
  "contact-us": "Contact Us",
  privacy: "Privacy Policy",
  security: "Security Policy",
  cookies: "Cookies Policy",
  industries: "Industries",
};

/**
 * schema.org BreadcrumbList for a pathname.
 *
 * Unlike the visible trail, this is emitted for top-level pages too ("Home ›
 * Contact Us"): a two-item list is valid, and it is what lets a search result
 * show the site's hierarchy instead of a bare URL. The homepage gets nothing — a
 * one-item list is not a trail.
 *
 * `currentLabel` replaces the last crumb's name, for pages whose slug is not a
 * good label (a post title, a CMS page title).
 *
 * @returns {object|null}
 */
export function buildBreadcrumbSchema(pathname, { siteUrl, currentLabel } = {}) {
  if (typeof pathname !== "string") return null;
  const base = trimBase(siteUrl);

  const path = pathname.split(/[?#]/)[0];
  const segments = path.split("/").filter(Boolean);
  if (segments.length === 0) return null;

  // buildBreadcrumbTrail only builds trails of two or more segments; a single
  // segment is assembled here with the same Home-first shape.
  const trail =
    segments.length >= 2
      ? buildBreadcrumbTrail(path)
      : [
          { label: "Home", href: "/" },
          {
            label:
              TOP_LEVEL_LABELS[segments[0]] ??
              SEGMENT_LABELS[segments[0]] ??
              segments[0]
                .split("-")
                .filter(Boolean)
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" "),
            href: `/${segments[0]}`,
          },
        ];

  const label = currentLabel?.trim();

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: index === trail.length - 1 && label ? label : crumb.label,
      item: crumb.href === "/" ? base : `${base}${crumb.href}`,
    })),
  };
}

/**
 * schema.org FAQPage from question/answer pairs.
 *
 * Empty or half-filled pairs are dropped, and duplicate questions are kept only
 * once — two Question nodes with the same name is a Rich Results Test warning,
 * and it happens on CMS pages where the same FAQ appears under two tabs.
 *
 * @param {Array<{question: string, answer: string}>} items
 * @returns {object|null} null when nothing is left to describe
 */
export function buildFaqSchema(items) {
  const seen = new Set();
  const entries = [];

  for (const item of items || []) {
    const question = String(item?.question ?? "").trim();
    const answer = String(item?.answer ?? "").trim();
    if (!question || !answer) continue;

    const key = question.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    entries.push({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    });
  }

  if (entries.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entries,
  };
}

/**
 * The question/answer pairs a CMS page's FAQ accordions show a visitor.
 *
 * Reads every `accordion` block — its flat `items` and the items inside each of
 * its tabs — and skips anything a visitor cannot see: inactive blocks, hidden
 * tabs, hidden rows. Marking up an answer that is not on the page is the one
 * thing Google's FAQ guidelines treat as spam.
 */
export function faqItemsFromSections(sections) {
  const out = [];
  const visible = (rows) => (rows || []).filter((row) => row && !row.hidden);

  for (const section of sections || []) {
    if (section?.type !== "accordion") continue;
    if (section.status && section.status !== "active") continue;

    const props = section.props || {};
    const tabs = visible(props.tabs);
    // AccordionBlock renders tabs in place of the flat list when it has any,
    // so the flat list is only content when there are no tabs.
    const rows = tabs.length
      ? tabs.flatMap((tab) => visible(tab.items))
      : visible(props.items);

    for (const row of rows) {
      out.push({ question: row.title, answer: row.body });
    }
  }

  return out;
}

/**
 * JSON for a <script type="application/ld+json"> body.
 *
 * Every string in these documents can be author-entered text. Escaping `<`
 * means a stray "</script>" in a question or a title stays data instead of
 * closing the tag early and spilling the rest of the document into the page.
 */
export const serializeJsonLd = (schema) =>
  JSON.stringify(schema).replace(/</g, "\\u003c");
