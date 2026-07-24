import test from "node:test";
import assert from "node:assert/strict";

import { pickRelatedPosts } from "./pickRelatedPosts.mjs";

const posts = [
  { slug: "current", tags: ["ai", "azure"], publishedAt: "2026-01-10" },
  { slug: "two-shared", tags: ["ai", "azure", "data"], publishedAt: "2026-01-01" },
  { slug: "one-shared", tags: ["ai"], publishedAt: "2026-01-05" },
  { slug: "no-shared-new", tags: ["design"], publishedAt: "2026-02-01" },
  { slug: "no-shared-old", tags: ["design"], publishedAt: "2025-06-01" },
];

test("excludes the current post", () => {
  const result = pickRelatedPosts(posts, "current", ["ai", "azure"], 10);
  assert.ok(!result.some((p) => p.slug === "current"));
});

test("ranks by number of shared tags, most first", () => {
  const result = pickRelatedPosts(posts, "current", ["ai", "azure"], 2);
  assert.deepEqual(
    result.map((p) => p.slug),
    ["two-shared", "one-shared"],
  );
});

test("falls back to the latest posts when tag matches run out", () => {
  const result = pickRelatedPosts(posts, "current", ["ai", "azure"], 4);
  assert.deepEqual(
    result.map((p) => p.slug),
    ["two-shared", "one-shared", "no-shared-new", "no-shared-old"],
  );
});

test("with no shared tags, returns latest first", () => {
  const result = pickRelatedPosts(posts, "current", [], 3);
  assert.equal(result[0].slug, "no-shared-new");
});

test("respects the limit", () => {
  assert.equal(pickRelatedPosts(posts, "current", ["ai"], 1).length, 1);
});

test("handles missing / empty input", () => {
  assert.deepEqual(pickRelatedPosts(null, "current", ["ai"]), []);
  assert.deepEqual(pickRelatedPosts([], "current", ["ai"]), []);
});
