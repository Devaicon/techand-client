import { toneOf } from "./tone";

// The heading-and-subtitle pair that opens most bands.
//
// Extracted because eleven blocks render it identically, and the alternative is
// eleven copies of the same three-size responsive type scale that drift apart
// the first time one of them is adjusted.
//
// Renders nothing when there is no heading and no subtitle — a block whose
// author left both blank should start at its content, not at an empty gap.
export default function SectionHeader({
  eyebrow,
  heading,
  subtitle,
  tone = "cream",
  align = "center",
  className = "",
}) {
  if (!heading && !subtitle && !eyebrow) return null;

  const { text } = toneOf(tone);
  const centred = align === "center";

  return (
    <div
      className={`${centred ? "text-center" : "text-left"} ${className || "mb-10"}`}
    >
      {eyebrow && (
        <span
          className={`mb-2 block text-[12px] font-semibold uppercase tracking-wide ${text.muted}`}
        >
          {eyebrow}
        </span>
      )}
      {heading && (
        <h2
          className={`text-3xl font-bold sm:text-4xl md:text-[42px] ${text.heading}`}
        >
          {heading}
        </h2>
      )}
      {subtitle && (
        <p
          className={`mt-3 max-w-[720px] text-base sm:text-lg ${text.body} ${
            centred ? "mx-auto" : ""
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
