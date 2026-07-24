import test from "node:test";
import assert from "node:assert/strict";

import { splitCtaSlots } from "./splitCtaSlots.mjs";

test("returns a single html segment when there are no markers", () => {
  assert.deepEqual(splitCtaSlots("<p>hello</p>"), [
    { type: "html", html: "<p>hello</p>" },
  ]);
});

test("splits around a marker in the middle", () => {
  assert.deepEqual(
    splitCtaSlots('<p>a</p><div data-cta-slot="k1"></div><p>b</p>'),
    [
      { type: "html", html: "<p>a</p>" },
      { type: "cta", key: "k1" },
      { type: "html", html: "<p>b</p>" },
    ],
  );
});

test("handles several markers and preserves their order", () => {
  const segments = splitCtaSlots(
    '<p>a</p><div data-cta-slot="k1"></div><p>b</p><div data-cta-slot="k2"></div><p>c</p>',
  );
  assert.deepEqual(
    segments.map((s) => s.key ?? s.html),
    ["<p>a</p>", "k1", "<p>b</p>", "k2", "<p>c</p>"],
  );
});

test("emits no empty html segments for adjacent markers", () => {
  const segments = splitCtaSlots(
    '<div data-cta-slot="k1"></div><div data-cta-slot="k2"></div>',
  );
  assert.deepEqual(segments, [
    { type: "cta", key: "k1" },
    { type: "cta", key: "k2" },
  ]);
});

test("handles a marker at the very start and very end", () => {
  assert.deepEqual(splitCtaSlots('<div data-cta-slot="k"></div><p>x</p>'), [
    { type: "cta", key: "k" },
    { type: "html", html: "<p>x</p>" },
  ]);
  assert.deepEqual(splitCtaSlots('<p>x</p><div data-cta-slot="k"></div>'), [
    { type: "html", html: "<p>x</p>" },
    { type: "cta", key: "k" },
  ]);
});

test("is not affected by a previous call's regex state", () => {
  const input = '<p>a</p><div data-cta-slot="k1"></div>';
  const first = splitCtaSlots(input);
  const second = splitCtaSlots(input);
  assert.deepEqual(first, second);
});

test("returns an empty array for empty or non-string input", () => {
  assert.deepEqual(splitCtaSlots(""), []);
  assert.deepEqual(splitCtaSlots(null), []);
  assert.deepEqual(splitCtaSlots(undefined), []);
});
