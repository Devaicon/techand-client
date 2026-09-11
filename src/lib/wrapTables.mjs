// Wraps each table in stored article HTML in a horizontal scroll container.
//
// The reader's article column is narrow (880px at most, far less on a phone),
// and a table is the one block that cannot reflow to fit it — a five-column
// pricing table either overflows the column and pushes the whole page sideways,
// or gets squeezed until every cell wraps to one word per line. Neither is
// fixable in CSS alone: `overflow-x` has to sit on an element *around* the
// table, and the body arrives as one opaque HTML string, so the wrapper has to
// be inserted here rather than written by the editor.
//
// Done on read rather than at save time so posts already in the database get it
// without being re-saved.
//
// .mjs so it can be unit-tested with `node --test` — the rest of the client is
// bundled by Next and has no test harness.

const OPEN_TABLE = /<table(\s[^>]*)?>/gi;
const ANY_TABLE_TAG = /<(\/?)table(?:\s[^>]*)?>/gi;

/**
 * @param {string} html Sanitized article HTML.
 * @returns {string} The same HTML with every top-level <table> wrapped.
 */
export function wrapTables(html) {
  if (!html || typeof html !== "string") return "";
  if (!/<table[\s>]/i.test(html)) return html;

  let out = "";
  let cursor = 0;

  // Reset lastIndex: OPEN_TABLE is a module-level global regex, so a previous
  // call would otherwise leave it mid-string and skip the first match.
  OPEN_TABLE.lastIndex = 0;

  let open = OPEN_TABLE.exec(html);
  while (open !== null) {
    const end = findTableEnd(html, open.index);

    // Unbalanced markup: emit the rest verbatim. A wrapper opened here would
    // never be closed, which is worse than leaving the table unwrapped.
    if (end === -1) break;

    out +=
      html.slice(cursor, open.index) +
      '<div class="blog-table-scroll">' +
      html.slice(open.index, end) +
      "</div>";

    cursor = end;
    // Resume past the whole table, so a table nested in a cell is not wrapped
    // a second time — it scrolls with its parent.
    OPEN_TABLE.lastIndex = end;
    open = OPEN_TABLE.exec(html);
  }

  return out + html.slice(cursor);
}

// Index just past the </table> that closes the table opening at `start`, or -1
// if it is never closed. Counts nested opens so an inner table's closing tag is
// not mistaken for the outer one's.
function findTableEnd(html, start) {
  ANY_TABLE_TAG.lastIndex = start;
  let depth = 0;

  let tag = ANY_TABLE_TAG.exec(html);
  while (tag !== null) {
    depth += tag[1] === "/" ? -1 : 1;
    if (depth === 0) return tag.index + tag[0].length;
    tag = ANY_TABLE_TAG.exec(html);
  }

  return -1;
}
