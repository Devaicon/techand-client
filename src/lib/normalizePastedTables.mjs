// Rewrites a pasted table into the only shape Quill 2 can actually store.
//
// Quill's table support is TD-only: its formats/table.js registers blots for
// TABLE > TBODY > TR > TD and nothing else, and its clipboard matcher is bound
// to `tr`. A <th> therefore matches no blot, so the paste does not merely lose
// the header styling — the cells stop being cells. A header row pasted as
//
//   <thead><tr><th>Field</th><th>Purpose</th></tr></thead>
//
// lands in the editor as a single cell reading "FieldPurpose", and since that
// happens in the clipboard converter, the damage is baked into the delta before
// anything reaches the server. Nothing downstream can recover it.
//
// So the header row is converted to ordinary cells here, on the way in. The
// reader styles the first row of a table as a header (see `.blog-prose table`
// in globals.css), which is what the author was after — a header row that reads
// as one — and it now has the right number of cells to do it with.
//
// .mjs so it can be unit-tested with `node --test` — the rest of the client is
// bundled by Next and has no test harness.

// `\b` after `th` is what keeps <thead>/<theme> and the word "this" intact:
// it only matches where `th` is followed by a tag-name boundary.
const HEADER_CELL_OPEN = /<th\b([^>]*)>/gi;
const HEADER_CELL_CLOSE = /<\/th\b[^>]*>/gi;

// Quill has no blot for these. Left in place they contribute nothing and, in
// the case of <colgroup>, can surface as stray text.
const UNWRAP_SECTIONS = /<\/?(thead|tfoot)\b[^>]*>/gi;
const DROP_COLGROUP = /<colgroup\b[^>]*>[\s\S]*?<\/colgroup>|<col\b[^>]*\/?>/gi;

/**
 * @param {string} html HTML from the clipboard.
 * @returns {string} The same HTML with header cells and table sections
 *   rewritten into the TD-only structure Quill can round-trip.
 */
export function normalizePastedTables(html) {
  if (!html || typeof html !== "string") return "";
  if (!/<(th|thead|tfoot|colgroup|col)\b/i.test(html)) return html;

  return html
    .replace(DROP_COLGROUP, "")
    // thead/tfoot are unwrapped rather than renamed: their <tr>s are already in
    // the order they should appear, and Quill rebuilds the <tbody> itself.
    .replace(UNWRAP_SECTIONS, "")
    .replace(HEADER_CELL_OPEN, "<td$1>")
    .replace(HEADER_CELL_CLOSE, "</td>");
}
