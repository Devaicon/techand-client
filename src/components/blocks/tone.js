// The page's background palette, as a token an author picks rather than a hex
// they type.
//
// The two site backgrounds alternate down a page — cream, lilac, cream — and
// that alternation is the only thing separating one band from the next, since
// the bands themselves are edge-to-edge. Letting an author choose a colour would
// mean the first off-palette pick breaks the rhythm for the whole page.
//
// `brand` is the gradient used by the CTA and hero bands, and `ink` is its flat
// counterpart — a solid deep indigo for a surface that wants to read as dark
// without the gradient's motion, e.g. the partner badge's card. Both carry light
// text, which is why `TONE_TEXT` exists alongside.
export const TONE_BG = {
  cream: "bg-[#fef9f3]",
  lilac: "bg-[#f1f0fa]",
  white: "bg-white",
  brand: "bg-gradient-to-b from-[#4555a7] to-[#53406b]",
  ink: "bg-[#1f1a42]",
};

export const TONE_TEXT = {
  cream: { heading: "text-[#0f172a]", body: "text-[#475569]", muted: "text-[#8b93b8]" },
  lilac: { heading: "text-[#0f172a]", body: "text-[#475569]", muted: "text-[#8b93b8]" },
  white: { heading: "text-[#0f172a]", body: "text-[#475569]", muted: "text-[#8b93b8]" },
  brand: { heading: "text-white", body: "text-white/85", muted: "text-white/60" },
  ink: { heading: "text-white", body: "text-white/85", muted: "text-white/60" },
};

// The tones that carry light text on a dark surface. A consumer keys off this
// rather than `=== "brand"` so that any dark tone — brand gradient or flat ink —
// gets the light borders, links and logo pairing without a growing OR-chain.
const DARK_TONES = new Set(["brand", "ink"]);

export const toneOf = (tone) => ({
  bg: TONE_BG[tone] || TONE_BG.cream,
  text: TONE_TEXT[tone] || TONE_TEXT.cream,
  // Retained for existing callers (Stats) that pre-date `ink`.
  onBrand: tone === "brand",
  dark: DARK_TONES.has(tone),
});
