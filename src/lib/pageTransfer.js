// Moving a page between installs — or out of one and back into the same one —
// as a plain JSON file.
//
// Entirely client-side, over the endpoints that already exist. There is no
// export or import route on the server, and deliberately so: an import is a
// `POST /pages` followed by one `POST /pages/:id/sections` per block, which is
// precisely what "duplicate page" on the list screen already does. A server
// route would need its own validation, its own permission check and its own
// tests to reach the same place, and would be a second way to write a page —
// the one thing `pages.service` is careful not to have.
//
// The upshot that matters: an imported block goes through `blocks.parseProps`
// like any other, so a file that has been hand-edited into nonsense is rejected
// field by field rather than trusted because it arrived as a "page export".

// Stamped into every file and checked on the way back in. A user who picks the
// wrong .json from their downloads folder should be told that, rather than
// watching an import half-succeed and leave a page full of empty blocks.
export const PAGE_EXPORT_FORMAT = "techanai.page";
export const PAGE_EXPORT_VERSION = 1;

// The page fields that are the author's to carry. `status`, `order`,
// `previewToken`, the timestamps and every id are omitted: they describe where
// a page sits in *this* install, and an import is by definition somewhere else.
// An imported page therefore always lands as a draft, which is also the safe
// default — nothing goes live because a file was opened.
const PAGE_FIELDS = [
  "title",
  "slug",
  "subtitle",
  "description",
  "metaTitle",
  "metaDescription",
];

/**
 * The object written to the file. Blocks keep their hidden/inactive state,
 * because "this block is parked" is part of the page an author is moving.
 */
export const buildPageExport = (page, sections) => ({
  format: PAGE_EXPORT_FORMAT,
  version: PAGE_EXPORT_VERSION,
  exportedAt: new Date().toISOString(),
  page: Object.fromEntries(
    PAGE_FIELDS.map((field) => [field, page?.[field] || ""]),
  ),
  sections: (sections || []).map((section) => ({
    type: section.type,
    status: section.status || "active",
    // Sent as-is. Block ids inside repeater rows ride along and are harmless:
    // `normaliseRows` keeps an id it is given, and these are unique per row, so
    // an imported collection's cards keep working keys.
    props: section.props || {},
  })),
});

// `page.slug` may contain slashes, which are not legal in a filename.
const fileNameFor = (page) =>
  `${(page?.slug || page?.title || "page").replace(/[^a-z0-9._-]+/gi, "-")}.page.json`;

/** Builds the file and hands it to the browser's download machinery. */
export const downloadPageExport = (page, sections) => {
  const blob = new Blob(
    [JSON.stringify(buildPageExport(page, sections), null, 2)],
    { type: "application/json" },
  );
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileNameFor(page);
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  // Revoked on the next tick rather than immediately: Safari has not finished
  // reading the blob by the time click() returns.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/**
 * Parses and checks a file's text.
 *
 * Throws an Error whose message is meant to be shown to the author verbatim —
 * every failure here is something they can act on (wrong file, newer format,
 * empty page), so there is nothing to gain from a code they would have to look
 * up.
 *
 * @returns {{page: Object, sections: Array}} the file's contents, normalised
 */
export const parsePageExport = (text) => {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("That file is not valid JSON.");
  }

  if (!data || data.format !== PAGE_EXPORT_FORMAT) {
    throw new Error(
      "That file is not a page export. Pick a .page.json file exported from a page editor.",
    );
  }

  if (Number(data.version) > PAGE_EXPORT_VERSION) {
    throw new Error(
      `That file was written by a newer version of the page builder (format ${data.version}). Update the admin panel and try again.`,
    );
  }

  if (!data.page || typeof data.page !== "object") {
    throw new Error("That export has no page settings in it.");
  }

  if (!Array.isArray(data.sections)) {
    throw new Error("That export has no block list in it.");
  }

  return {
    page: Object.fromEntries(
      PAGE_FIELDS.map((field) => [field, data.page[field] || ""]),
    ),
    // A block with no type could never be created, and letting one through would
    // turn into a confusing per-block error halfway through the import.
    sections: data.sections.filter((s) => s && typeof s.type === "string"),
  };
};

/**
 * Splits an export's blocks into the ones this install can create and the ones
 * it cannot, against the catalog from `GET /admin/blocks`.
 *
 * Checked before anything is written rather than discovered as a 400 on block
 * seven of twelve: an author deciding whether to import a page needs to know
 * what will be missing from it while they can still say no.
 */
export const splitByKnownType = (sections, definitions) => {
  const known = new Set((definitions || []).map((d) => d.type));
  return {
    supported: sections.filter((s) => known.has(s.type)),
    unsupported: sections.filter((s) => !known.has(s.type)),
  };
};

/**
 * Creates the page and its blocks.
 *
 * Blocks go up one at a time, not in a `Promise.all`: `order` is assigned
 * server-side by appending to the end, so concurrent creates would land in a
 * nondeterministic order — the same reason "duplicate page" is sequential.
 *
 * A block the server rejects is collected rather than thrown, so one bad block
 * in a long file does not abandon the import with a half-built page and no
 * report of what went wrong. The page row itself is the exception: if that
 * fails there is nothing to add blocks to.
 *
 * @returns {{page: Object, added: number, failed: Array<{type: string, message: string}>}}
 */
export const importPage = async (api, { page, sections }) => {
  const { data: created } = await api.post("/pages", page);
  const saved = created.data.page;

  const failed = [];
  let added = 0;

  for (const section of sections) {
    try {
      await api.post(`/pages/${saved.id}/sections`, {
        type: section.type,
        props: section.props || {},
        status: section.status === "inactive" ? "inactive" : "active",
      });
      added += 1;
    } catch (err) {
      failed.push({
        type: section.type,
        message: err.response?.data?.message || "rejected by the server",
      });
    }
  }

  return { page: saved, added, failed };
};
