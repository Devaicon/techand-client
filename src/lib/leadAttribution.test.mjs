import test from "node:test";
import assert from "node:assert/strict";
import { attributionFields, readUtm, recordLanding, trackLead } from "./leadAttribution.mjs";

const memory = () => {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)) };
};

test("UTM tags are read and trimmed to 100 chars", () => {
  assert.deepEqual(readUtm("?utm_source=linkedin&utm_medium=social&x=1"), { source: "linkedin", medium: "social" });
  assert.equal(readUtm(`?utm_campaign=${"c".repeat(150)}`).campaign.length, 100);
  assert.deepEqual(readUtm(""), {});
});

test("the first page of the visit is kept; later pages do not overwrite it", () => {
  const s = memory();
  recordLanding({ pathname: "/insights/a", search: "?utm_source=google" }, s);
  recordLanding({ pathname: "/contact-us", search: "" }, s);
  assert.deepEqual(attributionFields({ pathname: "/contact-us" }, s), {
    sourcePage: "/contact-us",
    landingPage: "/insights/a",
    utm: { source: "google" },
  });
});

test("no storage (private mode) still yields the source page", () => {
  recordLanding({ pathname: "/a", search: "" }, null);
  assert.deepEqual(attributionFields({ pathname: "/contact-us" }, null), { sourcePage: "/contact-us" });
});

test("storage that throws is survived", () => {
  const broken = { getItem() { throw new Error("denied"); }, setItem() { throw new Error("denied"); } };
  recordLanding({ pathname: "/a", search: "" }, broken);
  assert.deepEqual(attributionFields({ pathname: "/b" }, broken), { sourcePage: "/b" });
});

test("paths are capped at 300 characters", () => {
  const long = "/" + "a".repeat(400);
  assert.equal(attributionFields({ pathname: long }, null).sourcePage.length, 300);
});

test("trackLead fires a generate_lead event only when gtag exists", () => {
  const calls = [];
  trackLead("callback", { gtag: (...args) => calls.push(args) });
  trackLead("callback", {});
  trackLead("callback", undefined);
  assert.deepEqual(calls, [["event", "generate_lead", { form_type: "callback" }]]);
});
