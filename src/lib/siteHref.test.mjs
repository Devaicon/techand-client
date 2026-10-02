import test from "node:test";
import assert from "node:assert/strict";

import { normalizeNavbarHrefs, siteHref } from "./siteHref.mjs";

test("a slug typed without its leading slash is anchored to the site root", () => {
  // The production bug: this resolved to /capabilities/dynamics-365-… on
  // /capabilities/data, a 404 on every nested page.
  assert.equal(
    siteHref("dynamics-365-project-operations-uae"),
    "/dynamics-365-project-operations-uae",
  );
  assert.equal(siteHref("insights/agentic-ai"), "/insights/agentic-ai");
});

test("links that already resolve correctly are left alone", () => {
  for (const href of [
    "/contact-us",
    "#faq",
    "?tab=2",
    "https://www.linkedin.com/company/techand.ai/",
    "http://example.com",
    "mailto:contact@techand.ai",
    "tel:+971507020541",
    "//cdn.example.com/x",
  ]) {
    assert.equal(siteHref(href), href);
  }
});

test("a bare host gets https, a dot-relative path gets the root", () => {
  assert.equal(siteHref("www.partner.com/page"), "https://www.partner.com/page");
  assert.equal(siteHref("./contact-us"), "/contact-us");
  assert.equal(siteHref("../../contact-us"), "/contact-us");
});

test("empty values stay empty so the caller's fallback applies", () => {
  assert.equal(siteHref(""), "");
  assert.equal(siteHref("   "), "");
  assert.equal(siteHref(undefined), "");
  assert.equal(siteHref(null), "");
});

test("every href in the navbar tree is normalised, without mutating it", () => {
  const navbar = {
    ctaLabel: "Talk to us",
    ctaHref: "contact-us",
    items: [
      {
        title: "Services",
        href: "services",
        columns: [
          {
            title: "Dynamics",
            href: "/dynamics",
            links: [
              { title: "Project Ops", href: "dynamics-365-project-operations-uae" },
              { title: "No link" },
            ],
          },
        ],
      },
    ],
  };
  const frozen = JSON.stringify(navbar);

  const fixed = normalizeNavbarHrefs(navbar);

  assert.equal(fixed.ctaHref, "/contact-us");
  assert.equal(fixed.items[0].href, "/services");
  assert.equal(fixed.items[0].columns[0].href, "/dynamics");
  assert.equal(
    fixed.items[0].columns[0].links[0].href,
    "/dynamics-365-project-operations-uae",
  );
  assert.equal(fixed.items[0].columns[0].links[1].href, undefined);
  assert.equal(JSON.stringify(navbar), frozen);
});
