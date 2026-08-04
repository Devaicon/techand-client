// A wireframe sketch of what a block looks like, drawn from its field
// descriptors rather than from a hand-made picture per block type.
//
// The alternative — an SVG or screenshot per block — means ~20 assets to draw
// for Cycle 3 and one more every time a block is added, each of which silently
// goes stale the first time the block's design changes. Deriving the sketch from
// the fields keeps it roughly honest for free: a block with a background image
// gets a photo band, a block with a repeater gets a row of cards, a block with
// two links gets two buttons.
//
// It is a hint, not a rendering. It exists so the palette reads as shapes
// instead of a list of names.

const BAR = "#c7cbe4";
const STRONG = "#37469e";
const MEDIA = "#e2e5f3";

// Which fields imply which marks. Order matters — it is the order they stack.
const analyse = (fields) => {
  const has = (control) => fields.some((f) => f.control === control);
  const named = (name) => fields.some((f) => f.name === name);

  return {
    media: has("image"),
    eyebrow: named("eyebrow"),
    heading: fields.some((f) => f.control === "text"),
    body: has("textarea"),
    list: has("list"),
    repeater: fields.find((f) => f.control === "repeater"),
    links: fields.filter((f) => f.control === "link").length,
    // A block whose only image is called `media` is a lockup beside copy, not a
    // background — the two-column sketch reads that far better than a band.
    split: named("align"),
  };
};

export default function BlockThumbnail({ definition, className = "" }) {
  const f = analyse(definition.fields || []);

  // ── two-column: copy beside a stack of cards ──────────────────────────────
  if (f.split) {
    return (
      <svg viewBox="0 0 96 56" className={className} aria-hidden="true">
        <rect width="96" height="56" rx="4" fill="#f6f7fb" />
        <rect x="8" y="12" width="30" height="4" rx="2" fill={STRONG} />
        <rect x="8" y="20" width="34" height="3" rx="1.5" fill={BAR} />
        <rect x="8" y="26" width="26" height="3" rx="1.5" fill={BAR} />
        <rect x="8" y="36" width="20" height="8" rx="2" fill={MEDIA} />
        {[0, 1, 2].map((i) => (
          <rect
            key={i}
            x="54"
            y={11 + i * 12}
            width="34"
            height="10"
            rx="2"
            fill="#fff"
            stroke={BAR}
            strokeWidth="1"
          />
        ))}
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 96 56" className={className} aria-hidden="true">
      <rect width="96" height="56" rx="4" fill="#f6f7fb" />

      {/* A background image fills the block; a lockup sits inline. */}
      {f.media && !f.repeater && (
        <rect x="0" y="0" width="96" height="56" rx="4" fill={MEDIA} />
      )}

      {f.eyebrow && <rect x="30" y="9" width="16" height="3" rx="1.5" fill={BAR} />}

      {f.heading && (
        <rect
          x="24"
          y={f.eyebrow ? 15 : 11}
          width="48"
          height="5"
          rx="2.5"
          fill={STRONG}
        />
      )}

      {f.body && (
        <>
          <rect x="18" y={f.eyebrow ? 24 : 20} width="60" height="3" rx="1.5" fill={BAR} />
          <rect x="26" y={f.eyebrow ? 30 : 26} width="44" height="3" rx="1.5" fill={BAR} />
        </>
      )}

      {f.list && !f.repeater &&
        [0, 1, 2].map((i) => (
          <g key={i}>
            <circle cx="24" cy={34 + i * 6} r="1.5" fill={STRONG} />
            <rect x="29" y={32.5 + i * 6} width="40" height="3" rx="1.5" fill={BAR} />
          </g>
        ))}

      {/* A repeater is the block's substance — draw its rows as cards. */}
      {f.repeater &&
        [0, 1, 2].map((i) => (
          <rect
            key={i}
            x={9 + i * 27}
            y={f.heading ? 26 : 16}
            width="24"
            height="22"
            rx="2"
            fill="#fff"
            stroke={BAR}
            strokeWidth="1"
          />
        ))}

      {/* Buttons, only when there is room under everything else. */}
      {f.links > 0 && !f.repeater && !f.list && (
        <>
          <rect
            x={f.links > 1 ? 24 : 36}
            y="40"
            width="20"
            height="7"
            rx="3.5"
            fill={STRONG}
          />
          {f.links > 1 && (
            <rect
              x="48"
              y="40"
              width="20"
              height="7"
              rx="3.5"
              fill="none"
              stroke={STRONG}
              strokeWidth="1"
            />
          )}
        </>
      )}
    </svg>
  );
}
