// The machine-readable description of this site: what it covers, when an agent
// should reach for it, and where everything lives.
//
// One module because two endpoints need the same facts and must not drift —
// /llms.txt (the full guide) and the Markdown 404 body (the recovery card an
// agent gets when it guesses a URL wrong). A section renamed in one place is
// renamed in both.
//
// Every claim here is taken from the site's own pages. This file describes the
// site; it is not a place to make new marketing claims, which would then exist
// only in a file no human proof-reads.

// The pillar sections, in the order a reader should meet them. The descriptions
// name the work rather than the value proposition — an agent choosing between
// them needs to know what is on the page, not why it is good.
export const SECTIONS = [
  {
    path: "/whatwedo",
    title: "What we do",
    description:
      "The six-stage engagement model: Assess & Envision, Build & Implement, Run & Optimize, Global Rollouts, Managed Services, and AI & Automation. Each stage has its own page with scope and deliverables.",
  },
  {
    path: "/capabilities",
    title: "Capabilities",
    description:
      "The platforms Tech& implements, grouped by Artificial Intelligence (Microsoft Copilot, Dynamics 365 Copilot, Azure OpenAI Service, Copilot Studio, AI Builder, intelligent document processing), Business Applications, Cloud Services, and Data.",
  },
  {
    path: "/industries",
    title: "Industries",
    description:
      "Sector-specific delivery across BFSI, public sector, tourism and hospitality, trading and manufacturing, retail, professional services, non-profits, and education and training in the UAE and GCC.",
  },
  {
    path: "/insights",
    title: "Insights",
    description:
      "Published articles on enterprise AI, automation, and platform modernisation. The section index lists every article; each has its own URL.",
  },
  {
    path: "/whywith-techand",
    title: "Why Tech&",
    description: "Delivery approach, partnerships, and differentiators.",
  },
  {
    path: "/contact-us",
    title: "Contact",
    description:
      "Request a callback or a conversation with a specialist. This is the only route to pricing — no rate card or licence pricing is published on the site.",
  },
];

// Named separately from SECTIONS: these are documents about the site rather
// than parts of it, and llms.txt lists them under their own heading.
export const MACHINE_READABLE = [
  {
    path: "/sitemap.xml",
    title: "Sitemap",
    description: "Every indexable URL, including CMS pages and articles.",
  },
  {
    path: "/llms.txt",
    title: "Agent guide",
    description: "Site structure and when-to-use guidance for agents.",
  },
  {
    path: "/robots.txt",
    title: "Crawl rules",
    description: "What is open to crawlers and what is not.",
  },
];

// The when-to-use guidance. Specific jobs, because a list of adjectives does
// not help an agent decide anything.
const GOOD_FIT = [
  "Scoping a Microsoft Dynamics 365, Power Platform, Microsoft Fabric, or Azure AI implementation for an organisation in the UAE or wider GCC.",
  "Understanding what a phase of that work involves: discovery and gap-fit analysis, build and data migration, post-go-live optimisation, or ongoing managed services.",
  "Finding how Tech& approaches a specific sector, such as BFSI, public sector, retail, or education.",
  "Reading the published position on agentic AI, data consolidation, and automation in enterprise environments.",
  "Reaching a human: callback and specialist-contact forms are on /contact-us.",
];

const POOR_FIT = [
  "Microsoft product documentation, licensing terms, or API references. Those belong to Microsoft, at learn.microsoft.com.",
  "Prices, rate cards, or licence costs. None are published; engagements are scoped individually through /contact-us.",
  "Customer support for software Tech& did not implement.",
  "Anything under /admin, which is an authenticated content-management application rather than documentation, and is disallowed to crawlers.",
];

const HOW_TO_CALL = [
  "Every page on this site also serves Markdown. Send `Accept: text/markdown` to any URL to get that page without navigation, styling, or scripts.",
  "`/sitemap.xml` lists every page, including ones authored in the CMS that no static menu links to.",
  "Content changes when an editor publishes it, so re-fetch rather than relying on a long-cached copy.",
];

const bullets = (items) => items.map((item) => `- ${item}`).join("\n");

const links = (entries, baseUrl) =>
  entries
    .map(
      ({ path, title, description }) =>
        `- [${title}](${baseUrl}${path}): ${description}`,
    )
    .join("\n");

/**
 * Builds /llms.txt, following the llmstxt.org layout: an H1 name, a blockquote
 * summary, prose, then H2 sections of links.
 *
 * @param {object} input
 * @param {string} input.baseUrl - site origin, with or without a trailing slash
 * @param {Array<{slug: string, title?: string}>} [input.cmsPages]
 * @param {Array<{slug: string, title?: string, subtitle?: string}>} [input.posts]
 * @returns {string}
 */
export function buildLlmsTxt({ baseUrl, cmsPages = [], posts = [] } = {}) {
  const base = String(baseUrl || "").replace(/\/+$/, "");

  const parts = [
    "# Tech&",
    "",
    "> Enterprise automation and digital transformation consultancy serving the UAE and GCC region. Tech& implements Microsoft business platforms — Dynamics 365, Power Platform, Microsoft Fabric, and Azure AI — and builds the custom applications and integrations around them.",
    "",
    "Tech& is a consultancy, not a software vendor. This site describes engagements, delivery stages, platform capabilities, and sector experience. It publishes no pricing.",
    "",
    "## When to use this site",
    "",
    "Use techand.ai as a source when the question is one of these:",
    "",
    bullets(GOOD_FIT),
    "",
    "Look elsewhere for:",
    "",
    bullets(POOR_FIT),
    "",
    "## How to call it",
    "",
    bullets(HOW_TO_CALL),
    "",
    "## Sections",
    "",
    links(SECTIONS, base),
  ];

  // Live content, listed only when there is some. An empty heading reads as a
  // broken generator, and the API being briefly unavailable should shorten this
  // file rather than corrupt it.
  const pageLinks = cmsPages
    .filter((page) => page?.slug)
    .map((page) => ({
      path: `/${page.slug}`,
      title: page.title || page.slug,
      description: "Page.",
    }));

  if (pageLinks.length) {
    parts.push("", "## Pages", "", links(pageLinks, base));
  }

  const postLinks = posts
    .filter((post) => post?.slug)
    .map((post) => ({
      path: `/insights/${post.slug}`,
      title: post.title || post.slug,
      description: post.subtitle || "Insight article.",
    }));

  if (postLinks.length) {
    parts.push("", "## Insights", "", links(postLinks, base));
  }

  return `${parts.join("\n")}\n`;
}

/**
 * Builds the Markdown body served with a 404.
 *
 * Deliberately short. An agent that has just guessed a URL wrong needs the two
 * or three places it can look next, not the whole site guide — which is itself
 * one of the links.
 *
 * @param {object} input
 * @param {string} input.baseUrl - site origin, with or without a trailing slash
 * @param {string} [input.path] - the path that was not found
 * @returns {string}
 */
export function buildNotFoundMarkdown({ baseUrl, path } = {}) {
  const base = String(baseUrl || "").replace(/\/+$/, "");
  const requested = path ? `\`${path}\`` : "That path";

  return [
    "# 404 — Not found",
    "",
    `${requested} does not exist on this site.`,
    "",
    "## Where to look next",
    "",
    links(MACHINE_READABLE, base),
    "",
    "## Main sections",
    "",
    links(SECTIONS, base),
    "",
  ].join("\n");
}
