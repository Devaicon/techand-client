import test from "node:test";
import assert from "node:assert/strict";

import {
  BLOG_EXPORT_FORMAT,
  BLOG_EXPORT_VERSION,
  buildBlogExport,
  buildSampleBlogExport,
  exportFileName,
  fetchAllBlogs,
  fetchFullPosts,
  importBlogs,
  normalizePost,
  parseBlogExport,
} from "./blogTransfer.mjs";

const storedPost = {
  id: "65f000000000000000000001",
  title: "Agentic AI",
  slug: "agentic-ai",
  subtitle: "What changes",
  category: "AI",
  tags: ["AI"],
  contentHtml: "<h2 id=\"why\">Why</h2><p>Body</p>",
  contentDelta: { ops: [{ insert: "Body\n" }] },
  faqs: [{ question: "Q?", answer: "A." }],
  status: "published",
  publishedAt: "2026-08-01T00:00:00.000Z",
  previewToken: "must-not-travel",
  review: { note: "internal" },
  activity: [{ action: "published" }],
  createdBy: "u1",
  updatedAt: "2026-08-02T00:00:00.000Z",
};

const file = (posts) => JSON.stringify({ format: BLOG_EXPORT_FORMAT, version: 1, posts });

// ── writing ─────────────────────────────────────────────────────────────────

test("an export carries the article and nothing about this install's workflow", () => {
  const data = buildBlogExport([storedPost]);
  assert.equal(data.format, BLOG_EXPORT_FORMAT);
  assert.equal(data.version, BLOG_EXPORT_VERSION);

  const [post] = data.posts;
  assert.equal(post.title, "Agentic AI");
  assert.deepEqual(post.contentDelta, storedPost.contentDelta);
  for (const field of [
    "id", "status", "publishedAt", "previewToken", "review", "activity",
    "createdBy", "updatedAt",
  ]) {
    assert.equal(post[field], undefined, `${field} must not be exported`);
  }
});

test("file names: the slug for one post, a dated bundle for several", () => {
  assert.equal(exportFileName([storedPost]), "agentic-ai.blog.json");
  assert.match(
    exportFileName([storedPost, storedPost]),
    /^insights-export-\d{4}-\d{2}-\d{2}\.blog\.json$/,
  );
});

test("an export reads back in as the same posts", () => {
  const text = JSON.stringify(buildBlogExport([storedPost]));
  const { entries } = parseBlogExport(text);
  assert.equal(entries.length, 1);
  assert.deepEqual(entries[0].problems, []);
  assert.equal(entries[0].post.contentHtml, storedPost.contentHtml);
});

// ── the sample ──────────────────────────────────────────────────────────────

test("the sample file imports cleanly exactly as downloaded", () => {
  const sample = buildSampleBlogExport();
  assert.ok(sample._readme, "the sample documents its fields");

  const { entries } = parseBlogExport(JSON.stringify(sample));
  assert.equal(entries.length, 1);
  assert.deepEqual(entries[0].problems, []);
  // _readme is not a post field and must not reach the API.
  assert.equal(entries[0].post._readme, undefined);
});

test("the sample's inline CTA marker matches a CTA key", () => {
  const [post] = buildSampleBlogExport().posts;
  const inline = post.ctas.filter((c) => c.placement === "inline");
  assert.ok(inline.length > 0);
  for (const cta of inline) {
    assert.ok(post.contentHtml.includes(`data-cta-slot="${cta.key}"`));
  }
});

// ── reading ─────────────────────────────────────────────────────────────────

test("file-level problems throw a message an author can act on", () => {
  assert.throws(() => parseBlogExport("{nope"), /not valid JSON/);
  assert.throws(() => parseBlogExport(JSON.stringify({ posts: [] })), /sample file/);
  assert.throws(
    () => parseBlogExport(JSON.stringify({ format: "techanai.page", page: {} })),
    /not an insights export/,
  );
  assert.throws(
    () => parseBlogExport(JSON.stringify({ format: BLOG_EXPORT_FORMAT, version: 99, posts: [{}] })),
    /newer version/,
  );
  assert.throws(() => parseBlogExport(file([])), /no posts/);
});

test("a single `post` object is accepted as a one-post file", () => {
  const text = JSON.stringify({
    format: BLOG_EXPORT_FORMAT,
    version: 1,
    post: { title: "Solo", category: "AI" },
  });
  assert.equal(parseBlogExport(text).entries[0].post.title, "Solo");
});

test("one bad post is reported without failing the rest of the file", () => {
  const { entries } = parseBlogExport(
    file([{ title: "Good", category: "AI" }, { title: "", category: "" }]),
  );
  assert.deepEqual(entries[0].problems, []);
  assert.deepEqual(entries[1].problems, ["Missing a title.", "Missing a category."]);
});

test("unambiguous shortcuts are normalised rather than rejected", () => {
  const { post, problems } = normalizePost({
    title: "T",
    category: "C",
    tags: "AI, ERP , ",
    subtitle: null,
    ctas: [{ title: "Talk", href: "/contact-us" }],
  });
  assert.deepEqual(problems, []);
  assert.deepEqual(post.tags, ["AI", "ERP"]);
  assert.equal("subtitle" in post, false, "null means unset");
  assert.equal(post.ctas[0].placement, "end");
  assert.match(post.ctas[0].key, /^cta-/);
});

test("links the server would refuse are reported up front", () => {
  const { problems } = normalizePost({
    title: "T",
    category: "C",
    canonicalUrl: "javascript:alert(1)",
    ctas: [{ title: "x", href: "contact-us", placement: "middle" }],
    externalLinks: [{ label: "", url: "ftp://x" }],
    faqs: [{ question: "Q?" }],
    isFeatured: "yes",
  });
  assert.deepEqual(problems, [
    "canonicalUrl must start with https:// or /.",
    "CTA 1 link must start with https:// or /.",
    "CTA 1 placement must be inline, end or sidebar.",
    "External link 1 needs a label.",
    "External link 1 must start with https:// or /.",
    "FAQ 1 needs both a question and an answer.",
    '"isFeatured" must be true or false.',
  ]);
});

// ── API calls ───────────────────────────────────────────────────────────────

test("fetchAllBlogs walks every page of the admin list", async () => {
  const rows = Array.from({ length: 230 }, (_, i) => ({ id: String(i) }));
  const calls = [];
  const api = {
    get: async (url, { params }) => {
      calls.push(params);
      const start = (params.page - 1) * params.limit;
      return {
        data: { data: { blogs: rows.slice(start, start + params.limit), total: rows.length } },
      };
    },
  };

  const all = await fetchAllBlogs(api, { status: "published" });
  assert.equal(all.length, 230);
  assert.equal(calls.length, 3);
  assert.equal(calls[0].status, "published");
});

test("fetchFullPosts keeps the requested order and reports progress", async () => {
  const progress = [];
  const api = {
    get: async (url) => {
      await new Promise((r) => setTimeout(r, Math.random() * 5));
      return { data: { data: { blog: { id: url.split("/").pop() } } } };
    },
  };

  const posts = await fetchFullPosts(api, ["a", "b", "c", "d", "e"], {
    concurrency: 2,
    onProgress: (done) => progress.push(done),
  });
  assert.deepEqual(posts.map((p) => p.id), ["a", "b", "c", "d", "e"]);
  assert.deepEqual(progress, [1, 2, 3, 4, 5]);
});

test("importBlogs creates in file order and collects rejections", async () => {
  const sent = [];
  const api = {
    post: async (url, body) => {
      sent.push(body.title);
      if (body.title === "Bad") {
        const err = new Error("400");
        err.response = { data: { message: "Category is required" } };
        throw err;
      }
      return { data: { data: { blog: { id: body.title, title: body.title } } } };
    },
  };

  const result = await importBlogs(api, [
    { title: "One" },
    { title: "Bad" },
    { title: "Two" },
  ]);
  assert.deepEqual(sent, ["One", "Bad", "Two"]);
  assert.deepEqual(result.created.map((b) => b.title), ["One", "Two"]);
  assert.deepEqual(result.failed, [{ title: "Bad", message: "Category is required" }]);
});
