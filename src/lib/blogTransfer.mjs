// Moving insight posts in and out of the admin panel as plain JSON files.
//
// Entirely client-side, over endpoints that already exist — the same decision
// pageTransfer.mjs made, for the same reason. An export is `GET /blogs/:id` per
// post; an import is one `POST /blogs` per post. Every imported post therefore
// goes through createBlogSchema and blog.service like a post typed into the
// editor: the body is sanitised, the TOC is rebuilt, the slug is made unique,
// and a hand-edited file full of nonsense is rejected field by field rather than
// trusted because it arrived as an "export".
//
// `.mjs` so `node --test` can import it directly. The functions that touch
// `document` only do so inside their bodies.

export const BLOG_EXPORT_FORMAT = "techanai.blog";
export const BLOG_EXPORT_VERSION = 1;

// The post fields that belong to the article and travel with it. Omitted on
// purpose: ids, `status`, `review`, `activity`, `publishedAt`, `previewToken`,
// `createdBy`/`updatedBy` and the timestamps. They describe where a post sits in
// *this* install's workflow, and the server owns every one of them — an import
// always lands as a draft, so nothing goes live because a file was opened.
export const POST_FIELDS = [
  "title",
  "slug",
  "subtitle",
  "metaTitle",
  "metaDescription",
  "metaKeywords",
  "canonicalUrl",
  "category",
  "categories",
  "tags",
  "readTime",
  "heroImage",
  "cardImage",
  "author",
  "contentHtml",
  "contentDelta",
  "toc",
  "ctas",
  "externalLinks",
  "faqs",
  "isFeatured",
  "comingSoon",
];

const STRING_LIST_FIELDS = ["metaKeywords", "categories", "tags"];
const CTA_PLACEMENTS = ["inline", "end", "sidebar"];

// Mirrors `httpUrl` in server/src/validators/blog.validator.js, so a bad CTA
// link is reported before anything is written instead of as a 400 halfway
// through a batch.
const isHttpOrPath = (v) =>
  typeof v === "string" && (/^https?:\/\//i.test(v.trim()) || v.trim().startsWith("/"));

const nonEmpty = (v) => typeof v === "string" && v.trim() !== "";

/** The exportable subset of one post. Empty optional fields are kept as-is. */
export const pickPost = (post) =>
  Object.fromEntries(
    POST_FIELDS.filter((field) => post?.[field] !== undefined).map((field) => [
      field,
      post[field],
    ]),
  );

/** The object written to the file. */
export const buildBlogExport = (posts) => ({
  format: BLOG_EXPORT_FORMAT,
  version: BLOG_EXPORT_VERSION,
  exportedAt: new Date().toISOString(),
  posts: (posts || []).map(pickPost),
});

const today = () => new Date().toISOString().slice(0, 10);

/** `my-post.blog.json` for one post, a dated bundle name for several. */
export const exportFileName = (posts) =>
  posts?.length === 1 && posts[0]?.slug
    ? `${posts[0].slug.replace(/[^a-z0-9._-]+/gi, "-")}.blog.json`
    : `insights-export-${today()}.blog.json`;

/** Hands a JSON document to the browser's download machinery. */
export const downloadJson = (data, fileName) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  // Revoked on the next tick rather than immediately: Safari has not finished
  // reading the blob by the time click() returns.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

// ── the sample file ──────────────────────────────────────────────────────────

/**
 * A complete, importable example: one post with every field filled in, and a
 * `_readme` block describing each one. The parser ignores `_readme`, so the
 * sample imports exactly as downloaded — the quickest way for someone writing a
 * file by hand (or generating one) to check their format is to start from it.
 */
export const buildSampleBlogExport = () => ({
  format: BLOG_EXPORT_FORMAT,
  version: BLOG_EXPORT_VERSION,
  exportedAt: new Date().toISOString(),
  _readme: {
    about:
      "Insights import file. Put one or more posts in `posts`. Every post is created as a NEW DRAFT; nothing is published and no existing post is changed. Keys starting with an underscore are ignored.",
    required: {
      title: "The article title (H1 on the page).",
      category:
        "The primary category, shown as the badge on the post and its card.",
    },
    optional: {
      slug: "URL segment: /insights/<slug>. Derived from the title when omitted. If it is already taken the importer can skip the post, or the server adds -2, -3…",
      subtitle: "Shown under the title and used as the meta description fallback.",
      metaTitle: "Exact <title> for search results (~60 chars). Falls back to the title.",
      metaDescription: "Search snippet (~155 chars). Falls back to the subtitle.",
      metaKeywords: "Array of strings (a comma-separated string is also accepted).",
      canonicalUrl: "Leave empty to use the post's own URL. Must be https://… or start with /.",
      categories: "Array of strings — the filters the post appears under on /insights.",
      tags: "Array of strings — used to pick related articles.",
      readTime: "e.g. \"6 min read\". Estimated from the body when empty.",
      heroImage:
        "{ url, alt, publicId, focus: center|top|bottom|left|right, zoom: 1–3 }. url should be a public image URL (Cloudinary recommended).",
      cardImage: "Same shape as heroImage — the thumbnail on listing cards.",
      author: "{ name, role, avatarUrl } — the byline.",
      contentHtml:
        "The article body as HTML: <h2>/<h3>/<h4>, <p>, <ul>/<ol>, <a>, <strong>, <em>, <blockquote>, <table>, <img>. It is sanitised on import and the table of contents is built from the headings. To place an inline CTA, put <div data-cta-slot=\"KEY\"></div> where it should appear and give a CTA in `ctas` the same key.",
      contentDelta:
        "Editor-internal. Exports include it so a post round-trips exactly; leave it out (or null) in a hand-written file and the editor loads contentHtml instead.",
      toc: "Optional overrides: [{ id, label, hidden }] — id is the heading's id. Usually omitted.",
      ctas: "[{ key, title, description, buttonLabel, href, placement: inline|end|sidebar }]. href must be https://… or start with /. key is generated when omitted.",
      externalLinks: "[{ label, url, description }] — the 'Further reading' rail.",
      faqs: "[{ question, answer }] — plain text. Rendered as an FAQ accordion and emitted as FAQPage structured data.",
      isFeatured: "true to show in the featured rail once published.",
      comingSoon: "true to show the card as 'coming soon'.",
    },
  },
  posts: [
    {
      title: "How Dynamics 365 Business Central Supports UAE VAT Compliance",
      slug: "business-central-uae-vat-compliance",
      subtitle:
        "What Business Central handles out of the box for UAE VAT, and where finance teams still need to configure it.",
      metaTitle: "Business Central UAE VAT Compliance Guide | Tech&",
      metaDescription:
        "How Dynamics 365 Business Central handles UAE VAT: tax setup, return reporting, reverse charge and e-invoicing readiness.",
      metaKeywords: ["business central uae vat", "dynamics 365 vat uae"],
      canonicalUrl: "",
      category: "Finance",
      categories: ["Finance", "ERP"],
      tags: ["Business Central", "VAT", "UAE"],
      readTime: "6 min read",
      heroImage: {
        url: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
        alt: "Finance team reviewing a VAT return in Business Central",
        publicId: "",
        focus: "center",
        zoom: 1,
      },
      cardImage: {
        url: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
        alt: "Business Central VAT setup screen",
        publicId: "",
        focus: "center",
        zoom: 1,
      },
      author: {
        name: "Tech& Editorial Team",
        role: "Dynamics 365 Consultants",
        avatarUrl: "",
      },
      contentHtml: [
        "<p>UAE VAT has applied at 5% since 2018. Business Central covers most of what a finance team needs, provided the tax setup is done properly.</p>",
        "<h2>What Business Central handles out of the box</h2>",
        "<ul><li>VAT posting groups for standard, zero-rated and exempt supplies</li><li>VAT return reporting by period</li><li>Reverse charge on imported services</li></ul>",
        "<div data-cta-slot=\"vat-health-check\"></div>",
        "<h2>Where configuration is still needed</h2>",
        "<p>Designated zone transactions, partial exemption and e-invoicing readiness each need deliberate setup.</p>",
      ].join(""),
      ctas: [
        {
          key: "vat-health-check",
          title: "Get a VAT configuration health check",
          description: "We review your Business Central tax setup against current FTA rules.",
          buttonLabel: "Book a review",
          href: "/contact-us",
          placement: "inline",
        },
      ],
      externalLinks: [
        {
          label: "UAE Federal Tax Authority",
          url: "https://tax.gov.ae/",
          description: "Official VAT guidance and registration.",
        },
      ],
      faqs: [
        {
          question: "Does Business Central support UAE VAT returns?",
          answer:
            "Yes. With VAT posting groups configured, Business Central produces the figures needed for the FTA VAT return for each period.",
        },
        {
          question: "Is Business Central ready for UAE e-invoicing?",
          answer:
            "It can be, with the right localisation and an accredited service provider integration. The rollout timeline determines when that configuration is needed.",
        },
      ],
      isFeatured: false,
      comingSoon: false,
    },
  ],
});

// ── reading a file ───────────────────────────────────────────────────────────

const toStringList = (value) => {
  if (Array.isArray(value)) {
    return value.map((v) => String(v ?? "").trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value.split(",").map((v) => v.trim()).filter(Boolean);
  }
  return undefined;
};

const randomKey = () => `cta-${Math.random().toString(36).slice(2, 10)}`;

/**
 * Normalises one post from a file and lists what would stop it importing.
 *
 * Forgiving where intent is unambiguous — a comma-separated tag string becomes
 * an array, a CTA with no key gets one, a missing placement means "end", `null`
 * means "not set". Strict where the server would refuse the post anyway, so the
 * author hears about it in the confirm step, not as a failure after the fact.
 *
 * @returns {{post: Object, problems: string[]}}
 */
export const normalizePost = (raw) => {
  const problems = [];
  const post = {};

  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { post, problems: ["Not a post object."] };
  }

  for (const field of POST_FIELDS) {
    const value = raw[field];
    // contentDelta is the one field where null is meaningful to the server
    // ("no editor delta"); everywhere else null just means unset.
    if (value === undefined || (value === null && field !== "contentDelta")) continue;
    post[field] = value;
  }

  for (const field of STRING_LIST_FIELDS) {
    if (post[field] === undefined) continue;
    const list = toStringList(post[field]);
    if (list === undefined) problems.push(`"${field}" must be a list of strings.`);
    else post[field] = list;
  }

  if (!nonEmpty(post.title)) problems.push("Missing a title.");
  if (!nonEmpty(post.category)) problems.push("Missing a category.");

  for (const field of [
    "slug", "subtitle", "metaTitle", "metaDescription", "canonicalUrl",
    "readTime", "contentHtml",
  ]) {
    if (post[field] !== undefined && typeof post[field] !== "string") {
      problems.push(`"${field}" must be text.`);
    }
  }

  if (nonEmpty(post.canonicalUrl) && !isHttpOrPath(post.canonicalUrl)) {
    problems.push("canonicalUrl must start with https:// or /.");
  }

  for (const field of ["heroImage", "cardImage", "author"]) {
    if (post[field] !== undefined && (typeof post[field] !== "object" || Array.isArray(post[field]))) {
      problems.push(`"${field}" must be an object.`);
    }
  }

  for (const field of ["toc", "ctas", "externalLinks", "faqs"]) {
    if (post[field] !== undefined && !Array.isArray(post[field])) {
      problems.push(`"${field}" must be a list.`);
      delete post[field];
    }
  }

  if (post.ctas) {
    post.ctas = post.ctas.map((cta, i) => {
      const n = i + 1;
      if (!nonEmpty(cta?.title)) problems.push(`CTA ${n} needs a title.`);
      if (!isHttpOrPath(cta?.href)) {
        problems.push(`CTA ${n} link must start with https:// or /.`);
      }
      const placement = cta?.placement ?? "end";
      if (!CTA_PLACEMENTS.includes(placement)) {
        problems.push(`CTA ${n} placement must be inline, end or sidebar.`);
      }
      return { ...cta, key: nonEmpty(cta?.key) ? cta.key : randomKey(), placement };
    });
  }

  (post.externalLinks || []).forEach((link, i) => {
    if (!nonEmpty(link?.label)) problems.push(`External link ${i + 1} needs a label.`);
    if (!isHttpOrPath(link?.url)) {
      problems.push(`External link ${i + 1} must start with https:// or /.`);
    }
  });

  (post.faqs || []).forEach((faq, i) => {
    if (!nonEmpty(faq?.question) || !nonEmpty(faq?.answer)) {
      problems.push(`FAQ ${i + 1} needs both a question and an answer.`);
    }
  });

  for (const field of ["isFeatured", "comingSoon"]) {
    if (post[field] !== undefined && typeof post[field] !== "boolean") {
      problems.push(`"${field}" must be true or false.`);
    }
  }

  return { post, problems };
};

/**
 * Parses a file's text.
 *
 * Throws an Error whose message is shown to the author verbatim for anything
 * wrong with the file as a whole. Problems with individual posts do not throw:
 * they come back per post, so one bad post in a batch of twenty does not stop
 * the other nineteen.
 *
 * @returns {{entries: Array<{post: Object, problems: string[]}>}}
 */
export const parseBlogExport = (text) => {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("That file is not valid JSON.");
  }

  if (!data || data.format !== BLOG_EXPORT_FORMAT) {
    throw new Error(
      `That file is not an insights export. It needs "format": "${BLOG_EXPORT_FORMAT}" — download the sample file to see the expected layout.`,
    );
  }

  if (Number(data.version) > BLOG_EXPORT_VERSION) {
    throw new Error(
      `That file was written by a newer version of the admin panel (format ${data.version}). Update the admin panel and try again.`,
    );
  }

  // `posts` is the format; a lone `post` is accepted too, since that is the
  // obvious thing to write by hand for a single article.
  const raw = Array.isArray(data.posts) ? data.posts : data.post ? [data.post] : null;
  if (!raw) throw new Error('That file has no "posts" list in it.');
  if (raw.length === 0) throw new Error("That file has no posts in it.");

  return { entries: raw.map(normalizePost) };
};

// ── talking to the API ───────────────────────────────────────────────────────

const PAGE_SIZE = 100;

/**
 * Every post matching the admin list filters, across all pages. The list
 * endpoint pages at 20 by default, so "export everything" cannot just reuse
 * what the list screen has on hand.
 */
export const fetchAllBlogs = async (api, { status, q } = {}) => {
  const all = [];
  for (let page = 1; ; page += 1) {
    const { data } = await api.get("/blogs", {
      params: { status, q: q || undefined, page, limit: PAGE_SIZE },
    });
    const batch = data.data.blogs || [];
    all.push(...batch);
    if (batch.length < PAGE_SIZE || all.length >= (data.data.total ?? 0)) break;
  }
  return all;
};

/**
 * Loads the full documents for a list of ids — the list endpoint omits the body
 * — a few at a time, so a 60-post export neither runs serially for a minute nor
 * fires 60 requests at once.
 */
export const fetchFullPosts = async (api, ids, { concurrency = 4, onProgress } = {}) => {
  const out = new Array(ids.length);
  let next = 0;
  let done = 0;

  const worker = async () => {
    while (next < ids.length) {
      const index = next++;
      const { data } = await api.get(`/blogs/${ids[index]}`);
      out[index] = data.data.blog;
      done += 1;
      onProgress?.(done, ids.length);
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(concurrency, ids.length) }, worker),
  );
  return out;
};

/**
 * Creates the posts, one at a time and in file order.
 *
 * A post the server rejects is collected rather than thrown, so one bad post
 * does not abandon the rest of the batch with no report of what happened.
 *
 * @returns {{created: Object[], failed: Array<{title: string, message: string}>}}
 */
export const importBlogs = async (api, posts, { onProgress } = {}) => {
  const created = [];
  const failed = [];

  for (const [index, post] of posts.entries()) {
    try {
      const { data } = await api.post("/blogs", post);
      created.push(data.data.blog);
    } catch (err) {
      failed.push({
        title: post.title || `Post ${index + 1}`,
        message: err.response?.data?.message || "Rejected by the server.",
      });
    }
    onProgress?.(index + 1, posts.length);
  }

  return { created, failed };
};
