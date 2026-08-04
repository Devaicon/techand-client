import SmartLink from "./SmartLink";

/**
 * The closing call to action under a card collection.
 *
 * Deliberately quieter than the `cta` block: this one is a footer to a set of
 * cards, and a full gradient band drawn inside a collection would read as a
 * second section that had lost its own heading. An author who wants the loud
 * version already has a block for it.
 *
 * Renders nothing unless there is something to render — which is what lets the
 * fields sit on every collection without changing the ones that ignore them.
 *
 * `dark` is for the boxed-panel layout, where this sits on the blue panel rather
 * than on the page background.
 */
export default function CollectionCta({
  heading,
  body,
  link,
  secondaryLink,
  dark = false,
}) {
  const hasPrimary = Boolean(link?.href && link?.label);
  const hasSecondary = Boolean(secondaryLink?.href && secondaryLink?.label);

  if (!heading && !body && !hasPrimary && !hasSecondary) return null;

  return (
    <div
      className={`mt-10 border-t pt-8 text-center ${
        dark ? "border-white/15" : "border-black/5"
      }`}
    >
      {heading && (
        <h3
          className={`text-[22px] font-bold sm:text-[26px] ${
            dark ? "text-white" : "text-[#0f172a]"
          }`}
        >
          {heading}
        </h3>
      )}

      {body && (
        <p
          className={`mx-auto mt-2 max-w-[640px] text-base leading-7 ${
            dark ? "text-white/80" : "text-[#475569]"
          }`}
        >
          {body}
        </p>
      )}

      {(hasPrimary || hasSecondary) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <SmartLink href={link?.href} label={link?.label}>
            <span
              className={`inline-flex h-12 items-center justify-center rounded-[8px] px-7 font-semibold transition-all duration-300 ${
                dark
                  ? "bg-white text-[#37469e] hover:bg-white/90"
                  : "bg-gradient-to-b from-[#4555a7] to-[#53406b] text-white hover:from-[#5266bf] hover:to-[#654e7f] hover:shadow-lg"
              }`}
            >
              {link?.label}
            </span>
          </SmartLink>

          <SmartLink href={secondaryLink?.href} label={secondaryLink?.label}>
            <span
              className={`inline-flex h-12 items-center justify-center rounded-[8px] border px-7 font-semibold transition-colors duration-300 ${
                dark
                  ? "border-white/40 text-white hover:bg-white/10"
                  : "border-[#37469e]/30 text-[#37469e] hover:bg-[#37469e]/5"
              }`}
            >
              {secondaryLink?.label}
            </span>
          </SmartLink>
        </div>
      )}
    </div>
  );
}
