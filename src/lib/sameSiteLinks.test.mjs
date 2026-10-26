import test from "node:test";
import assert from "node:assert";

import { relativizeSameSiteLinks } from "./sameSiteLinks.mjs";

test("makes a bare-domain article link relative", () => {
  const out = relativizeSameSiteLinks(
    '<a href="https://techand.ai/insights/a-post" target="_blank">x</a>',
  );
  assert.strictEqual(out, '<a href="/insights/a-post" target="_blank">x</a>');
});

test("makes a www link relative too", () => {
  const out = relativizeSameSiteLinks('<a href="https://www.techand.ai/whatwedo">x</a>');
  assert.strictEqual(out, '<a href="/whatwedo">x</a>');
});

test("turns the home page, with or without a slash, into /", () => {
  assert.strictEqual(
    relativizeSameSiteLinks('<a href="https://techand.ai/">x</a>'),
    '<a href="/">x</a>',
  );
  assert.strictEqual(
    relativizeSameSiteLinks('<a href="http://techand.ai">x</a>'),
    '<a href="/">x</a>',
  );
});

test("keeps a query string and fragment", () => {
  assert.strictEqual(
    relativizeSameSiteLinks('<a href="https://techand.ai/insights?tag=ai#list">x</a>'),
    '<a href="/insights?tag=ai#list">x</a>',
  );
  assert.strictEqual(
    relativizeSameSiteLinks('<a href="https://techand.ai#top">x</a>'),
    '<a href="/#top">x</a>',
  );
});

test("handles single-quoted attributes", () => {
  assert.strictEqual(
    relativizeSameSiteLinks("<a href='https://techand.ai/x'>x</a>"),
    "<a href='/x'>x</a>",
  );
});

test("leaves other sites and look-alike hosts alone", () => {
  const html =
    '<a href="https://learn.microsoft.com/x">a</a>' +
    '<a href="https://blog.techand.ai/x">b</a>' +
    '<a href="https://techand.ai.example.com/x">c</a>' +
    '<a href="https://notechand.ai/x">d</a>';
  assert.strictEqual(relativizeSameSiteLinks(html), html);
});

test("does not touch the URL when it appears as text or in src", () => {
  const html = '<p>Visit https://techand.ai/x</p><img src="https://techand.ai/a.png">';
  assert.strictEqual(relativizeSameSiteLinks(html), html);
});

test("passes empty and non-string input through", () => {
  assert.strictEqual(relativizeSameSiteLinks(""), "");
  assert.strictEqual(relativizeSameSiteLinks(undefined), undefined);
});
