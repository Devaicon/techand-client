import test from "node:test";
import assert from "node:assert/strict";
import {
  addDays, describeChange, dubaiToday, formatDuration, formatMetric, formatNumber, formatPct,
  formatPosition, monthLabel, resolvePreset, shortDate, withShare,
} from "./analyticsFormat.mjs";

const NOW = new Date("2026-10-05T08:00:00Z"); // 5 Oct in Dubai → yesterday 4 Oct

test("presets end yesterday in the UAE", () => {
  assert.equal(dubaiToday(NOW), "2026-10-05");
  assert.deepEqual(resolvePreset("28d", NOW), { from: "2026-09-07", to: "2026-10-04" });
  assert.deepEqual(resolvePreset("7d", NOW), { from: "2026-09-28", to: "2026-10-04" });
  assert.deepEqual(resolvePreset("90d", NOW), { from: "2026-07-07", to: "2026-10-04" });
  assert.deepEqual(resolvePreset("this-month", NOW), { from: "2026-10-01", to: "2026-10-04" });
  assert.deepEqual(resolvePreset("last-month", NOW), { from: "2026-09-01", to: "2026-09-30" });
  assert.deepEqual(resolvePreset("nonsense", NOW), resolvePreset("28d", NOW));
  assert.equal(addDays("2026-03-01", -1), "2026-02-28");
});

test("numbers, percentages, ranks and durations; missing is a dash", () => {
  assert.equal(formatNumber(1234), "1,234");
  assert.equal(formatNumber(15300), "15.3K");
  assert.equal(formatNumber(null), "—");
  assert.equal(formatPct(0.1234), "12%");
  assert.equal(formatPct(0.1234, 1), "12.3%");
  assert.equal(formatPosition(11.44), "11.4");
  assert.equal(formatDuration(75), "1m 15s");
  assert.equal(formatDuration(42), "42s");
  assert.equal(formatMetric("position", null), "—");
  assert.equal(formatMetric("pct", 0.05), "5.0%");
});

test("change text: arrows follow good/bad, not up/down", () => {
  assert.deepEqual(describeChange({ value: 110, previous: 100, delta: 10, pct: 0.1, direction: "up", good: true }), { text: "▲ 10%", tone: "good" });
  assert.deepEqual(describeChange({ value: 90, previous: 100, delta: -10, pct: -0.1, direction: "down", good: false }), { text: "▼ 10%", tone: "bad" });
  assert.deepEqual(
    describeChange({ value: 8.2, previous: 9.5, delta: -1.3, pct: -0.13, direction: "down", good: true }, { kind: "position" }),
    { text: "▲ 1.3", tone: "good" },
  );
  assert.deepEqual(
    describeChange({ value: 0.05, previous: 0.04, delta: 0.01, pct: 0.25, direction: "up", good: true }, { kind: "pct" }),
    { text: "▲ 1.0 pts", tone: "good" },
  );
  assert.deepEqual(describeChange({ value: 5, previous: 0, delta: 5, pct: null, direction: "up", good: true }), { text: "▲ 5", tone: "good" });
  assert.deepEqual(describeChange({ value: 5, previous: null, delta: null, pct: null, direction: "flat", good: null }), { text: "no earlier data", tone: "neutral" });
  assert.deepEqual(describeChange({ value: 5, previous: 5, delta: 0, pct: 0, direction: "flat", good: null }), { text: "no change", tone: "neutral" });
  assert.deepEqual(describeChange(null), { text: "—", tone: "neutral" });
});

test("dates read naturally", () => {
  assert.equal(shortDate("2026-10-01"), "1 Oct");
  assert.equal(monthLabel("2026-10"), "October 2026");
});

test("slices get their share of the total", () => {
  assert.deepEqual(withShare([{ name: "a", value: 3 }, { name: "b", value: 1 }]), [
    { name: "a", value: 3, share: 0.75 },
    { name: "b", value: 1, share: 0.25 },
  ]);
  assert.deepEqual(withShare([]), []);
});
