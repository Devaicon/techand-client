import test from "node:test";
import assert from "node:assert";

import { seoFilename } from "./seoFilename.mjs";

test("drops the extension Cloudinary re-appends itself", () => {
  assert.equal(seoFilename("agent-dashboard.png"), "agent-dashboard");
  assert.equal(seoFilename("photo.final.JPEG"), "photo-final");
});

test("collapses everything outside [a-z0-9] to single hyphens", () => {
  assert.equal(
    seoFilename("Agentic AI — Q3 Results (final).png"),
    "agentic-ai-q3-results-final",
  );
  assert.equal(seoFilename("IMG_4471 (1).HEIC"), "img-4471-1");
});

test("never leaves a leading or trailing hyphen in the public id", () => {
  assert.equal(seoFilename("  --spaced--  .png"), "spaced");
});

test("caps the length without leaving a dangling separator", () => {
  const name = `${"a".repeat(78)} bcdefgh.png`;
  const out = seoFilename(name);
  assert.ok(out.length <= 80);
  assert.ok(!out.endsWith("-"));
});

test("falls back to a usable name when nothing survives", () => {
  // Cloudinary rejects an empty public id, so these must not slug to "".
  assert.equal(seoFilename("©.png"), "image");
  assert.equal(seoFilename(""), "image");
  assert.equal(seoFilename(undefined), "image");
});

test("keeps a post-slug prefix readable in the delivery URL", () => {
  assert.equal(
    seoFilename("moving-agents-to-production-Screenshot 2026-08-21.png"),
    "moving-agents-to-production-screenshot-2026-08-21",
  );
});
