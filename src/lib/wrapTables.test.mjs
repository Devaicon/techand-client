import test from "node:test";
import assert from "node:assert";

import { wrapTables } from "./wrapTables.mjs";

test("wraps a table in a horizontal scroll container", () => {
  const out = wrapTables("<p>a</p><table><tbody><tr><td>x</td></tr></tbody></table>");
  assert.strictEqual(
    out,
    '<p>a</p><div class="blog-table-scroll"><table><tbody><tr><td>x</td></tr></tbody></table></div>',
  );
});

test("wraps every table in the document", () => {
  const out = wrapTables("<table><tr><td>1</td></tr></table><p>mid</p><table><tr><td>2</td></tr></table>");
  assert.strictEqual(out.match(/blog-table-scroll/g).length, 2);
  assert.ok(out.includes("<p>mid</p>"));
});

test("keeps a table's own attributes", () => {
  const out = wrapTables('<table class="ql-table" data-x="1"><tr><td>x</td></tr></table>');
  assert.ok(out.includes('<table class="ql-table" data-x="1">'));
});

// A table pasted from a document can contain another table in a cell. A
// non-greedy match to the first </table> would close the wrapper in the middle
// of the outer table and leave stray markup behind, so the scan tracks depth.
test("wraps only the outer table when tables are nested", () => {
  const out = wrapTables(
    "<table><tr><td><table><tr><td>inner</td></tr></table></td></tr></table>",
  );
  assert.strictEqual(out.match(/blog-table-scroll/g).length, 1);
  assert.ok(out.startsWith('<div class="blog-table-scroll"><table>'));
  assert.ok(out.endsWith("</table></div>"));
});

test("leaves html without tables untouched", () => {
  const html = "<p>no tables here</p><ul><li>a</li></ul>";
  assert.strictEqual(wrapTables(html), html);
});

test("leaves an unclosed table alone rather than emitting a broken wrapper", () => {
  const html = "<p>a</p><table><tr><td>x</td></tr>";
  assert.strictEqual(wrapTables(html), html);
});

test("returns an empty string for non-string input", () => {
  assert.strictEqual(wrapTables(null), "");
  assert.strictEqual(wrapTables(undefined), "");
  assert.strictEqual(wrapTables(42), "");
});
