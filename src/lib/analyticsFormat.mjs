// Pure formatting for the Analytics area — the layer between the server's
// numbers and the words and arrows a non-specialist reads.
//
// The rule that matters most is describeChange: the arrow shows whether a
// change is GOOD, not which way the number moved. A Google rank going from 9.5
// to 8.2 is an improvement and reads "▲ 1.3" in green, the same way a rise in
// visitors does. One visual language for "better" across every card.

export const RANGE_PRESETS = [
  { value: "7d", label: "Last 7 days" },
  { value: "28d", label: "Last 28 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "this-month", label: "This month" },
  { value: "last-month", label: "Last month" },
];

const DAY_MS = 86400000;
const parse = (d) => new Date(`${d}T00:00:00Z`);
const fmt = (date) => date.toISOString().slice(0, 10);

export const addDays = (d, n) => fmt(new Date(parse(d).getTime() + n * DAY_MS));

const DUBAI = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Dubai",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
export const dubaiToday = (now = new Date()) => DUBAI.format(now);

// Every preset ends yesterday: today is incomplete in both Google sources, and
// a half-day at the end of a chart reads as a collapse. "This month" is the
// month yesterday falls in, so on the 1st it is the month just finished.
export function resolvePreset(preset, now = new Date()) {
  const yesterday = addDays(dubaiToday(now), -1);
  const monthStart = `${yesterday.slice(0, 7)}-01`;
  switch (preset) {
    case "7d":
      return { from: addDays(yesterday, -6), to: yesterday };
    case "90d":
      return { from: addDays(yesterday, -89), to: yesterday };
    case "this-month":
      return { from: monthStart, to: yesterday };
    case "last-month": {
      const end = addDays(monthStart, -1);
      return { from: `${end.slice(0, 7)}-01`, to: end };
    }
    default:
      return { from: addDays(yesterday, -27), to: yesterday };
  }
}

const DASH = "—";

export const formatNumber = (v) =>
  v == null
    ? DASH
    : new Intl.NumberFormat(
        "en-US",
        Math.abs(v) >= 10000 ? { notation: "compact", maximumFractionDigits: 1 } : { maximumFractionDigits: 0 },
      ).format(v);

export const formatPct = (r, digits = 0) => (r == null ? DASH : `${(r * 100).toFixed(digits)}%`);
export const formatPosition = (p) => (p == null ? DASH : p.toFixed(1));

export const formatDuration = (sec) => {
  if (sec == null) return DASH;
  const s = Math.round(sec);
  const m = Math.floor(s / 60);
  return m ? `${m}m ${s % 60}s` : `${s}s`;
};

export const formatMetric = (kind, v) => {
  if (kind === "pct") return formatPct(v, 1);
  if (kind === "position") return formatPosition(v);
  if (kind === "duration") return formatDuration(v);
  return formatNumber(v);
};

export function describeChange(change, { kind = "count" } = {}) {
  if (!change || change.value == null) return { text: DASH, tone: "neutral" };
  if (change.previous == null) return { text: "no earlier data", tone: "neutral" };
  if (change.direction === "flat" || change.good == null) return { text: "no change", tone: "neutral" };

  const arrow = change.good ? "▲" : "▼";
  const tone = change.good ? "good" : "bad";
  const delta = Math.abs(change.delta);

  if (kind === "position") return { text: `${arrow} ${delta.toFixed(1)}`, tone };
  if (kind === "pct") return { text: `${arrow} ${(delta * 100).toFixed(1)} pts`, tone };
  if (change.pct == null) return { text: `${arrow} ${formatNumber(delta)}`, tone };
  return { text: `${arrow} ${formatPct(Math.abs(change.pct))}`, tone };
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export const shortDate = (d) => (d ? `${Number(d.slice(8, 10))} ${MONTHS[Number(d.slice(5, 7)) - 1]}` : "");
export const monthLabel = (m) => `${MONTHS_LONG[Number(m.slice(5, 7)) - 1]} ${m.slice(0, 4)}`;

export const withShare = (slices) => {
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  return slices.map((s) => ({ ...s, share: total ? s.value / total : 0 }));
};

// Categorical series colours, brand indigo first. Checked against the dataviz
// skill's palette validator in Task 16 (adjacent-contrast and colour-blind
// separation); replace values there, not here, if it flags any.
export const PALETTE = ["#37469E", "#E07A3F", "#2A9D8F", "#B5487B", "#8AA1E0", "#C9A227", "#6B7280", "#5E3B8C"];
