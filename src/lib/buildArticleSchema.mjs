// Builds the schema.org BlogPosting document for an insight page.
//
// Kept as a pure function (and out of the component) so the mapping decisions
// below are testable without rendering anything — they are the part search
// engines actually read, and the part most likely to drift as the blog model
// grows.
//
// Every optional key is omitted rather than emitted empty: a `description: ""`
// is worse than no description, because validators report it as a defect while
// an absent key is simply absent.

// Google stops showing the article rich result when the headline runs long.
const HEADLINE_MAX = 110;

const toIso = (value) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

// Cloudinary gives us absolute URLs; the local placeholder artwork does not.
// Structured data needs absolute either way.
const absolute = (url, base) => {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
};

// `updatedAt` is deliberately not used here. It bumps on any save — featuring a
// post, an approval state change, an activity-log append — so feeding it to
// dateModified would tell search engines the article was revised on days when
// nobody touched a word of it. The activity log already records which saves
// changed the prose, so that is what we date.
const lastTextEditAt = (activity) => {
  const stamps = (activity || [])
    .filter((entry) => entry?.textChanged && entry?.at)
    .map((entry) => new Date(entry.at).getTime())
    .filter((time) => !Number.isNaN(time));

  return stamps.length ? new Date(Math.max(...stamps)).toISOString() : undefined;
};

// The body is server-sanitized HTML; strip it back to prose for a rough count.
const countWords = (html) => {
  if (!html) return undefined;
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&[a-z]+;|&#\d+;/gi, " ");
  const words = text.split(/\s+/).filter(Boolean);
  return words.length || undefined;
};

export function buildArticleSchema(post, { siteUrl } = {}) {
  if (!post?.slug || !post?.title) return null;

  const base = String(siteUrl || "").replace(/\/+$/, "");
  const canonical = `${base}/insights/${post.slug}`;

  const datePublished = toIso(post.publishedAt) || toIso(post.createdAt);
  const dateModified = lastTextEditAt(post.activity) || datePublished;

  // Hero first — it is the one a reader associates with the post. The card
  // image is offered as a secondary crop when it is a genuinely different file.
  const images = [
    absolute(post.heroImage?.url, base),
    absolute(post.cardImage?.url, base),
  ].filter(Boolean);

  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title.slice(0, HEADLINE_MAX).trimEnd(),
    url: canonical,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    inLanguage: "en",
    publisher: {
      "@type": "Organization",
      name: "Tech&",
      url: base,
      logo: { "@type": "ImageObject", url: `${base}/logo.webp` },
    },
  };

  if (post.subtitle) schema.description = post.subtitle;
  if (images.length) schema.image = [...new Set(images)];
  if (datePublished) schema.datePublished = datePublished;
  if (dateModified) schema.dateModified = dateModified;
  if (post.category) schema.articleSection = post.category;
  if (post.tags?.length) schema.keywords = post.tags.join(", ");

  const wordCount = countWords(post.contentHtml);
  if (wordCount) schema.wordCount = wordCount;

  // Posts carry a denormalized byline, but it is optional in the model — a post
  // saved without one gets no author key rather than an invented publisher one.
  if (post.author?.name) {
    schema.author = { "@type": "Person", name: post.author.name };
    if (post.author.role) schema.author.jobTitle = post.author.role;
    const avatar = absolute(post.author.avatarUrl, base);
    if (avatar) schema.author.image = avatar;
  }

  return schema;
}
