import test from "node:test";
import assert from "node:assert/strict";

import {
  PAGE_EXPORT_FORMAT,
  PAGE_EXPORT_VERSION,
  buildPageExport,
  importPage,
  parsePageExport,
  splitByKnownType,
} from "./pageTransfer.mjs";

const samplePage = {
  id: "65f000000000000000000001",
  title: "Microsoft Dynamics Partner",
  slug: "solutions/dynamics-365-uae",
  subtitle: "Implementations across the UAE",
  description: "",
  metaTitle: "Dynamics 365 Partner — UAE",
  metaDescription: "Finance, supply chain, commerce and HR.",
  status: "published",
  previewToken: "must-not-travel",
  updatedAt: "2026-08-01T00:00:00.000Z",
};

const sampleSections = [
  { id: "a", type: "feature-split", status: "active", props: { heading: "How" } },
  { id: "b", type: "accordion", status: "inactive", props: { heading: "FAQ" } },
];

// ── writing the file ────────────────────────────────────────────────────────

test("an export carries the page's own fields and nothing about this install", () => {
  const file = buildPageExport(samplePage, sampleSections);

  assert.equal(file.format, PAGE_EXPORT_FORMAT);
  assert.equal(file.version, PAGE_EXPORT_VERSION);
  assert.equal(file.page.title, "Microsoft Dynamics Partner");
  assert.equal(file.page.slug, "solutions/dynamics-365-uae");

  // The fields that describe where a page sits *here*, not what it is.
  for (const key of ["id", "status", "previewToken", "updatedAt", "order"]) {
    assert.ok(!(key in file.page), `${key} must not travel in an export`);
  }
});

test("blocks keep their type, props and parked state; ids are not the point", () => {
  const file = buildPageExport(samplePage, sampleSections);

  assert.equal(file.sections.length, 2);
  assert.deepEqual(file.sections[0], {
    type: "feature-split",
    status: "active",
    props: { heading: "How" },
  });
  // A hidden block is part of the page an author is moving.
  assert.equal(file.sections[1].status, "inactive");
});

test("a page with no blocks still exports", () => {
  assert.deepEqual(buildPageExport(samplePage, []).sections, []);
  assert.deepEqual(buildPageExport(samplePage, undefined).sections, []);
});

// ── reading it back ─────────────────────────────────────────────────────────

test("an export round-trips through JSON unchanged", () => {
  const file = buildPageExport(samplePage, sampleSections);
  const back = parsePageExport(JSON.stringify(file));

  assert.equal(back.page.slug, samplePage.slug);
  assert.equal(back.page.metaDescription, samplePage.metaDescription);
  assert.deepEqual(back.sections, file.sections);
});

test("a file that is not JSON is named as such", () => {
  assert.throws(() => parsePageExport("<html>nope</html>"), /not valid JSON/);
});

test("someone else's JSON is rejected before anything is created", () => {
  assert.throws(
    () => parsePageExport(JSON.stringify({ hello: "world" })),
    /not a page export/,
  );
});

test("a file from a newer builder says so rather than importing half of it", () => {
  const file = { ...buildPageExport(samplePage, sampleSections), version: 99 };
  assert.throws(() => parsePageExport(JSON.stringify(file)), /newer version/);
});

test("an older format is still readable — that is the point of the number", () => {
  const file = { ...buildPageExport(samplePage, sampleSections), version: 0 };
  assert.equal(parsePageExport(JSON.stringify(file)).sections.length, 2);
});

test("a valid envelope with the wrong innards is caught field by field", () => {
  const base = { format: PAGE_EXPORT_FORMAT, version: 1 };

  assert.throws(
    () => parsePageExport(JSON.stringify({ ...base, sections: [] })),
    /no page settings/,
  );
  assert.throws(
    () => parsePageExport(JSON.stringify({ ...base, page: { title: "x" } })),
    /no block list/,
  );
});

test("a block with no type is dropped, since it could never be created", () => {
  const file = {
    ...buildPageExport(samplePage, sampleSections),
    sections: [{ type: "cta", props: {} }, { props: {} }, null],
  };

  assert.deepEqual(
    parsePageExport(JSON.stringify(file)).sections.map((s) => s.type),
    ["cta"],
  );
});

// ── checking it against this install ────────────────────────────────────────

test("blocks this site cannot render are separated out, not silently lost", () => {
  const { supported, unsupported } = splitByKnownType(
    [{ type: "cta" }, { type: "hologram" }, { type: "accordion" }],
    [{ type: "cta" }, { type: "accordion" }],
  );

  assert.deepEqual(supported.map((s) => s.type), ["cta", "accordion"]);
  assert.deepEqual(unsupported.map((s) => s.type), ["hologram"]);
});

test("an empty catalog means nothing is supported, not everything", () => {
  const { supported, unsupported } = splitByKnownType([{ type: "cta" }], []);
  assert.equal(supported.length, 0);
  assert.equal(unsupported.length, 1);
});

// ── creating the page ───────────────────────────────────────────────────────

// A stand-in for adminApi. Records what it was asked to do, so the assertions
// can be about the calls rather than about a database.
const fakeApi = (behaviour = {}) => {
  const calls = [];
  return {
    calls,
    post: async (url, body) => {
      calls.push({ url, body });
      if (url === "/pages") {
        return { data: { data: { page: { id: "new-id", title: body.title } } } };
      }
      const reject = behaviour.rejectType === body.type;
      if (reject) {
        const err = new Error("rejected");
        err.response = { data: { message: "Heading is required" } };
        throw err;
      }
      return { data: { data: { section: {} } } };
    },
  };
};

test("import creates the page first, then its blocks in file order", async () => {
  const api = fakeApi();
  const result = await importPage(api, {
    page: { title: "T", slug: "t" },
    sections: [
      { type: "feature-split", status: "active", props: { heading: "a" } },
      { type: "accordion", status: "inactive", props: { heading: "b" } },
    ],
  });

  assert.deepEqual(
    api.calls.map((c) => c.url),
    ["/pages", "/pages/new-id/sections", "/pages/new-id/sections"],
  );
  assert.deepEqual(
    api.calls.slice(1).map((c) => c.body.type),
    ["feature-split", "accordion"],
  );
  // A parked block arrives parked.
  assert.equal(api.calls[2].body.status, "inactive");
  assert.equal(result.added, 2);
  assert.deepEqual(result.failed, []);
});

test("one rejected block is reported, not allowed to abandon the import", async () => {
  const api = fakeApi({ rejectType: "accordion" });
  const result = await importPage(api, {
    page: { title: "T", slug: "t" },
    sections: [
      { type: "accordion", props: {} },
      { type: "cta", props: {} },
    ],
  });

  assert.equal(result.added, 1);
  assert.deepEqual(result.failed, [
    { type: "accordion", message: "Heading is required" },
  ]);
});

test("an unrecognised status is not passed through as one", async () => {
  const api = fakeApi();
  await importPage(api, {
    page: { title: "T", slug: "t" },
    sections: [{ type: "cta", status: "banana", props: {} }],
  });

  assert.equal(api.calls[1].body.status, "active");
});
