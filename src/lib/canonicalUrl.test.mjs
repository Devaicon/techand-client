import test from "node:test";
import assert from "node:assert/strict";

import { resolveCanonical } from "./canonicalUrl.mjs";

const SITE = "https://www.techand.ai";

test("no override canonicalises to the page's own URL on the www origin", () => {
  assert.equal(resolveCanonical("", "/insights/x", SITE), `${SITE}/insights/x`);
  assert.equal(resolveCanonical(undefined, "insights/x", `${SITE}/`), `${SITE}/insights/x`);
});

test("an override on the redirecting bare host is moved onto www", () => {
  assert.equal(
    resolveCanonical("https://techand.ai/insights/x", "/insights/y", SITE),
    `${SITE}/insights/x`,
  );
  assert.equal(
    resolveCanonical("http://www.techand.ai/insights/x/", "/insights/y", SITE),
    `${SITE}/insights/x`,
  );
});

test("the homepage canonical has no trailing slash", () => {
  assert.equal(resolveCanonical("https://techand.ai/", "/x", SITE), SITE);
});

test("a site-relative override is anchored to the origin", () => {
  assert.equal(resolveCanonical("/insights/x", "/insights/y", SITE), `${SITE}/insights/x`);
});

test("an override for a different site is kept verbatim", () => {
  const syndicated = "https://partner.example.com/article/42";
  assert.equal(resolveCanonical(syndicated, "/insights/x", SITE), syndicated);
});

test("an unparseable override falls back to the page's own URL", () => {
  assert.equal(resolveCanonical("not a url", "/insights/x", SITE), `${SITE}/insights/x`);
});
