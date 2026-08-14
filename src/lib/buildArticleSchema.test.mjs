import test from "node:test";
import assert from "node:assert/strict";

import { buildArticleSchema } from "./buildArticleSchema.mjs";

const SITE = "https://techand.ai";

const post = {
  slug: "agentic-automation",
  title: "Agentic automation in the GCC",
  subtitle: "What enterprise teams are actually shipping.",
  category: "Automation",
  tags: ["ai", "automation"],
  heroImage: { url: "https://res.cloudinary.com/demo/hero.webp" },
  author: { name: "Sara Haddad", role: "Principal Consultant" },
  contentHtml: "<p>One two three</p><p>four five</p>",
  publishedAt: "2026-07-22T09:00:00.000Z",
  updatedAt: "2026-08-11T14:30:00.000Z",
  activity: [],
};

const build = (overrides = {}) =>
  buildArticleSchema({ ...post, ...overrides }, { siteUrl: SITE });

test("describes the post as a BlogPosting", () => {
  const schema = build();
  assert.equal(schema["@context"], "https://schema.org");
  assert.equal(schema["@type"], "BlogPosting");
  assert.equal(schema.headline, post.title);
  assert.equal(schema.description, post.subtitle);
  assert.equal(schema.articleSection, "Automation");
});

test("points mainEntityOfPage and url at the canonical insight address", () => {
  const schema = build();
  assert.equal(schema.url, `${SITE}/insights/agentic-automation`);
  assert.equal(schema.mainEntityOfPage["@id"], `${SITE}/insights/agentic-automation`);
});

test("truncates a headline past Google's 110-character limit", () => {
  const long = "A".repeat(200);
  const schema = build({ title: long });
  assert.equal(schema.headline.length, 110);
});

test("keeps an already-absolute image url untouched", () => {
  const schema = build();
  assert.deepEqual(schema.image, ["https://res.cloudinary.com/demo/hero.webp"]);
});

test("absolutizes a site-relative image url", () => {
  const schema = build({ heroImage: { url: "/evolution_of_ai.webp" } });
  assert.deepEqual(schema.image, [`${SITE}/evolution_of_ai.webp`]);
});

test("datePublished falls back to createdAt when the post was never published", () => {
  const schema = build({ publishedAt: null, createdAt: "2026-07-01T00:00:00.000Z" });
  assert.equal(schema.datePublished, "2026-07-01T00:00:00.000Z");
});

test("dateModified is the newest activity entry that changed the text", () => {
  const schema = build({
    activity: [
      { at: "2026-07-25T10:00:00.000Z", textChanged: true },
      { at: "2026-08-02T10:00:00.000Z", textChanged: true },
      { at: "2026-07-30T10:00:00.000Z", textChanged: true },
    ],
  });
  assert.equal(schema.dateModified, "2026-08-02T10:00:00.000Z");
});

test("dateModified ignores saves that did not touch the prose", () => {
  const schema = build({
    activity: [
      { at: "2026-07-25T10:00:00.000Z", textChanged: true },
      { at: "2026-08-11T14:30:00.000Z", textChanged: false },
    ],
  });
  assert.equal(schema.dateModified, "2026-07-25T10:00:00.000Z");
});

test("dateModified falls back to the publish date when no text edit is recorded", () => {
  const schema = build({ activity: [] });
  assert.equal(schema.dateModified, post.publishedAt);
});

test("credits the byline as a Person with their role", () => {
  const schema = build();
  assert.equal(schema.author["@type"], "Person");
  assert.equal(schema.author.name, "Sara Haddad");
  assert.equal(schema.author.jobTitle, "Principal Consultant");
});

test("omits author entirely when the post has no byline", () => {
  const schema = build({ author: { name: "", role: "" } });
  assert.ok(!("author" in schema));
});

test("names Tech& as the publisher", () => {
  const schema = build();
  assert.equal(schema.publisher["@type"], "Organization");
  assert.equal(schema.publisher.name, "Tech&");
  assert.equal(schema.publisher.logo.url, `${SITE}/logo.webp`);
});

test("counts words from the rendered article body, not its markup", () => {
  const schema = build();
  assert.equal(schema.wordCount, 5);
});

test("returns null for a post with no slug or title", () => {
  assert.equal(buildArticleSchema(null, { siteUrl: SITE }), null);
  assert.equal(buildArticleSchema({ title: "x" }, { siteUrl: SITE }), null);
  assert.equal(buildArticleSchema({ slug: "x" }, { siteUrl: SITE }), null);
});

test("drops empty optional fields rather than emitting blank values", () => {
  const schema = build({ subtitle: "", tags: [], category: "", contentHtml: "" });
  assert.ok(!("description" in schema));
  assert.ok(!("keywords" in schema));
  assert.ok(!("articleSection" in schema));
  assert.ok(!("wordCount" in schema));
});
