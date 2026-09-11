import test from "node:test";
import assert from "node:assert";

import { normalizePastedTables } from "./normalizePastedTables.mjs";

test("rewrites header cells to data cells", () => {
  assert.strictEqual(
    normalizePastedTables("<table><tr><th>A</th><th>B</th></tr></table>"),
    "<table><tr><td>A</td><td>B</td></tr></table>",
  );
});

test("keeps attributes on a rewritten header cell", () => {
  assert.strictEqual(
    normalizePastedTables('<th colspan="2" class="x">A</th>'),
    '<td colspan="2" class="x">A</td>',
  );
});

test("handles a self-closing-style header cell and odd whitespace", () => {
  assert.strictEqual(
    normalizePastedTables("<TH >A</TH >"),
    "<td >A</td>",
  );
});

test("unwraps thead and tfoot so their rows stay in document order", () => {
  assert.strictEqual(
    normalizePastedTables(
      "<table><thead><tr><th>H</th></tr></thead><tbody><tr><td>B</td></tr></tbody>" +
        "<tfoot><tr><td>F</td></tr></tfoot></table>",
    ),
    "<table><tr><td>H</td></tr><tbody><tr><td>B</td></tr></tbody><tr><td>F</td></tr></table>",
  );
});

test("drops colgroup, which Quill cannot represent and would leak as text", () => {
  assert.strictEqual(
    normalizePastedTables(
      '<table><colgroup><col span="2"></colgroup><tr><td>A</td></tr></table>',
    ),
    "<table><tr><td>A</td></tr></table>",
  );
});

// The word "this" contains "th" and <thead>/<theme> start with it: a naive
// /<th/ replace would corrupt both.
test("does not touch text or other tags that merely start with th", () => {
  const html = "<p>this and that</p><table><tr><td>the third</td></tr></table>";
  assert.strictEqual(normalizePastedTables(html), html);
});

test("leaves html with no table untouched", () => {
  const html = "<p>hello</p><ul><li>a</li></ul>";
  assert.strictEqual(normalizePastedTables(html), html);
});

test("returns an empty string for non-string input", () => {
  assert.strictEqual(normalizePastedTables(null), "");
  assert.strictEqual(normalizePastedTables(undefined), "");
  assert.strictEqual(normalizePastedTables(42), "");
});
