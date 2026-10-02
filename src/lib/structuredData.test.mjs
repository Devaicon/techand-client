import test from "node:test";
import assert from "node:assert/strict";

import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildOrganizationSchema,
  buildWebSiteSchema,
  faqItemsFromSections,
  serializeJsonLd,
} from "./structuredData.mjs";

const SITE = "https://www.techand.ai";

// ── Organization / WebSite ──────────────────────────────────────────────────

test("the organization's logo is a file that exists, on the canonical host", () => {
  const org = buildOrganizationSchema({ siteUrl: `${SITE}/` });
  assert.equal(org["@type"], "Organization");
  assert.equal(org["@id"], `${SITE}/#organization`);
  assert.equal(org.url, SITE);
  // /logo.webp 404s in production; that is what made the old document invalid.
  assert.equal(org.logo.url, `${SITE}/logo1.png`);
});

test("sameAs only lists well-formed profile URLs", () => {
  const org = buildOrganizationSchema({ siteUrl: SITE });
  for (const url of org.sameAs) {
    assert.doesNotThrow(() => new URL(url));
    assert.ok(!url.includes("&"), `${url} is not a valid profile handle`);
  }
});

test("the WebSite names the Organization as its publisher by @id", () => {
  const site = buildWebSiteSchema({ siteUrl: SITE });
  assert.equal(site["@type"], "WebSite");
  assert.deepEqual(site.publisher, { "@id": `${SITE}/#organization` });
});

// ── BreadcrumbList ──────────────────────────────────────────────────────────

test("the homepage has no breadcrumb list", () => {
  assert.equal(buildBreadcrumbSchema("/", { siteUrl: SITE }), null);
  assert.equal(buildBreadcrumbSchema("", { siteUrl: SITE }), null);
  assert.equal(buildBreadcrumbSchema(undefined, { siteUrl: SITE }), null);
});

test("a top-level page gets Home › Page, with a readable label", () => {
  const schema = buildBreadcrumbSchema("/whywith-techand", { siteUrl: SITE });
  assert.equal(schema["@type"], "BreadcrumbList");
  assert.deepEqual(
    schema.itemListElement.map((i) => [i.position, i.name, i.item]),
    [
      [1, "Home", SITE],
      [2, "Why Tech&", `${SITE}/whywith-techand`],
    ],
  );
});

test("a nested page gets every level, with absolute item URLs", () => {
  const schema = buildBreadcrumbSchema("/capabilities/data", { siteUrl: SITE });
  assert.deepEqual(
    schema.itemListElement.map((i) => [i.name, i.item]),
    [
      ["Home", SITE],
      ["Capabilities", `${SITE}/capabilities`],
      ["Data", `${SITE}/capabilities/data`],
    ],
  );
});

test("currentLabel replaces only the last crumb's name", () => {
  const schema = buildBreadcrumbSchema("/insights/agentic-ai", {
    siteUrl: SITE,
    currentLabel: "  Agentic AI in the Enterprise ",
  });
  const names = schema.itemListElement.map((i) => i.name);
  assert.deepEqual(names, ["Home", "Insights", "Agentic AI in the Enterprise"]);
  assert.equal(schema.itemListElement[2].item, `${SITE}/insights/agentic-ai`);
});

test("query strings and fragments do not become crumbs", () => {
  const schema = buildBreadcrumbSchema("/capabilities?x=1#ai", { siteUrl: SITE });
  assert.equal(schema.itemListElement.length, 2);
  assert.equal(schema.itemListElement[1].item, `${SITE}/capabilities`);
});

// ── FAQPage ─────────────────────────────────────────────────────────────────

test("an FAQ list with nothing complete in it produces no document", () => {
  assert.equal(buildFaqSchema([]), null);
  assert.equal(buildFaqSchema(null), null);
  assert.equal(buildFaqSchema([{ question: "Q?", answer: "  " }]), null);
});

test("FAQ entries are trimmed and duplicate questions are kept once", () => {
  const schema = buildFaqSchema([
    { question: " What is it? ", answer: "A thing." },
    { question: "what is it?", answer: "Same question, other tab." },
    { question: "How long?", answer: "Weeks." },
  ]);
  assert.equal(schema["@type"], "FAQPage");
  assert.deepEqual(
    schema.mainEntity.map((q) => [q.name, q.acceptedAnswer.text]),
    [
      ["What is it?", "A thing."],
      ["How long?", "Weeks."],
    ],
  );
});

test("CMS FAQ items come only from visible accordion rows", () => {
  const sections = [
    { type: "feature-split", status: "active", props: { heading: "Not FAQ" } },
    {
      type: "accordion",
      status: "active",
      props: {
        items: [
          { title: "Shown?", body: "Yes." },
          { title: "Hidden row?", body: "No.", hidden: true },
        ],
      },
    },
    {
      type: "accordion",
      status: "inactive",
      props: { items: [{ title: "Parked block?", body: "No." }] },
    },
  ];
  assert.deepEqual(faqItemsFromSections(sections), [
    { question: "Shown?", answer: "Yes." },
  ]);
});

test("an accordion with tabs contributes its tab rows, not its flat list", () => {
  const sections = [
    {
      type: "accordion",
      status: "active",
      props: {
        items: [{ title: "Unrendered flat row", body: "Not drawn when tabs exist." }],
        tabs: [
          { title: "General", items: [{ title: "A?", body: "a" }] },
          { title: "Hidden tab", hidden: true, items: [{ title: "B?", body: "b" }] },
          { title: "Pricing", items: [{ title: "C?", body: "c" }] },
        ],
      },
    },
  ];
  assert.deepEqual(
    faqItemsFromSections(sections).map((i) => i.question),
    ["A?", "C?"],
  );
});

// ── serialisation ───────────────────────────────────────────────────────────

test("serialised JSON-LD cannot close its own script tag", () => {
  const json = serializeJsonLd({ name: "</script><script>alert(1)</script>" });
  assert.ok(!json.includes("</script>"));
  assert.equal(JSON.parse(json).name, "</script><script>alert(1)</script>");
});
