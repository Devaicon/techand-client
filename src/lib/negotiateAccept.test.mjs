import { test } from "node:test";
import assert from "node:assert/strict";
import { negotiate, HTML, MARKDOWN } from "./negotiateAccept.mjs";

test("a bare markdown request gets markdown", () => {
  assert.equal(negotiate("text/markdown"), MARKDOWN);
  assert.equal(negotiate("text/markdown; charset=utf-8"), MARKDOWN);
});

test("a real browser Accept header still gets HTML", () => {
  // Chrome, verbatim. The */*;q=0.8 at the end must not be read as a weak
  // preference for markdown that beats nothing.
  const chrome =
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7";
  assert.equal(negotiate(chrome), HTML);
});

test("a more specific range overrides a less specific one regardless of q", () => {
  // RFC 9110 §12.5.1. Sorting by q alone would answer markdown here, because
  // 0.9 > the exact match's implicit 1 is never even compared.
  assert.equal(negotiate("*/*;q=0.9, text/html"), HTML);
  // And the mirror image: html is explicitly weaker than the markdown match.
  assert.equal(negotiate("text/html;q=0.5, text/markdown;q=0.9"), MARKDOWN);
});

test("wildcards alone are not a request for markdown", () => {
  // The client expressed no preference, so the server picks its default.
  assert.equal(negotiate("*/*"), HTML);
  assert.equal(negotiate("text/*"), HTML);
});

test("a missing or empty Accept header gets HTML, never a 406", () => {
  // This is the path every Next.js RSC navigation and many crawlers take.
  assert.equal(negotiate(undefined), HTML);
  assert.equal(negotiate(null), HTML);
  assert.equal(negotiate(""), HTML);
  assert.equal(negotiate("   "), HTML);
});

test("q=0 is a refusal, not a weak preference", () => {
  // HTML is explicitly rejected; markdown is reachable through the wildcard.
  assert.equal(negotiate("text/html;q=0, */*"), MARKDOWN);
  // Everything is refused except an exact markdown match.
  assert.equal(negotiate("*/*;q=0, text/markdown"), MARKDOWN);
});

test("a client that can take neither representation gets a 406", () => {
  assert.equal(negotiate("application/pdf"), null);
  assert.equal(negotiate("image/png, image/webp"), null);
  // Both refused outright.
  assert.equal(negotiate("*/*;q=0"), null);
  assert.equal(negotiate("text/html;q=0, text/markdown;q=0"), null);
});

test("equal quality is a tie broken toward HTML", () => {
  assert.equal(negotiate("text/markdown, text/html"), HTML);
  assert.equal(negotiate("text/html, text/markdown"), HTML);
  assert.equal(negotiate("text/markdown;q=0.7, text/html;q=0.7"), HTML);
});

test("deprecated markdown spellings are understood on the way in", () => {
  // acceptmarkdown.com says not to SERVE these; refusing to READ them helps
  // nobody, since the intent is unambiguous.
  assert.equal(negotiate("text/x-markdown"), MARKDOWN);
  assert.equal(negotiate("application/markdown"), MARKDOWN);
});

test("header casing and stray whitespace do not change the outcome", () => {
  assert.equal(negotiate("TEXT/MARKDOWN"), MARKDOWN);
  assert.equal(negotiate("  text/markdown ;  q=0.9  "), MARKDOWN);
});

test("a malformed header degrades to HTML instead of erroring", () => {
  assert.equal(negotiate("garbage"), HTML);
  assert.equal(negotiate(",,,"), HTML);
  // An unparseable q is treated as absent, i.e. q=1, not as a refusal.
  assert.equal(negotiate("text/markdown;q=banana"), MARKDOWN);
});

test("a q above 1 or below 0 is clamped, not trusted", () => {
  // A malformed header must not let one type outrank an exact match by 5x.
  assert.equal(negotiate("*/*;q=5, text/html"), HTML);
  assert.equal(negotiate("text/markdown;q=-1, text/html"), HTML);
});
