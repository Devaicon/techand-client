import { ArrowRight } from "lucide-react";
import SmartLink from "./SmartLink";

/**
 * The closing call to action. Both buttons are optional — SmartLink renders
 * nothing for a link with no destination — so this works as a one-button band,
 * a two-button band, or a plain statement.
 *
 * Two treatments off the same fields. `band` fills the gradient edge to edge.
 * `card` floats a glass panel on it, which is what the solution pages close
 * with; the services page still uses the flat band, so this is a variant rather
 * than a redraw.
 */
export default function CtaBand({ props }) {
  const { eyebrow, heading, subtitle, link, secondaryLink, variant } = props;

  if (variant === "card") {
    return (
      <section className="bg-gradient-to-br from-[#4555a7] via-[#584a8c] to-[#6d4f8f] px-4 py-16 sm:px-6 md:px-8 md:py-24">
        <div className="mx-auto w-full max-w-[820px] rounded-[24px] border border-white/20 bg-white/10 p-8 text-center backdrop-blur-sm sm:p-12 md:p-14">
          {eyebrow && (
            <span className="block text-[13px] font-semibold uppercase tracking-[0.18em] text-white/70">
              {eyebrow}
            </span>
          )}

          {heading && (
            <h2 className="mt-4 text-3xl font-bold leading-tight text-white sm:text-4xl md:text-[44px]">
              {heading}
            </h2>
          )}

          {subtitle && (
            <p className="mx-auto mt-5 max-w-[560px] text-base leading-7 text-white/80">
              {subtitle}
            </p>
          )}

          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            {/* Outlined, not filled. A solid white button on a translucent
                panel reads as a second card sitting on the first. */}
            <SmartLink
              href={link?.href}
              label={link?.label}
              className="inline-flex h-[56px] w-full items-center justify-center gap-2 rounded-full border-2 border-white/80 px-8 font-semibold text-white transition-colors duration-300 hover:bg-white hover:text-[#37469e] sm:w-auto"
            >
              {link?.label}
              <ArrowRight size={16} aria-hidden="true" />
            </SmartLink>

            <SmartLink
              href={secondaryLink?.href}
              label={secondaryLink?.label}
              className="inline-flex h-[56px] items-center justify-center px-4 font-semibold text-white/80 underline-offset-4 transition-colors duration-300 hover:text-white hover:underline"
            />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-b from-[#4555a7] to-[#53406b] px-4 py-16 sm:px-6 md:px-8 md:py-20">
      <div className="mx-auto w-full max-w-[1180px] text-center">
        {eyebrow && (
          <span className="mb-3 block text-[13px] font-semibold uppercase tracking-[0.18em] text-white/70">
            {eyebrow}
          </span>
        )}

        {heading && (
          <h2 className="text-3xl font-bold text-white sm:text-4xl md:text-[48px]">
            {heading}
          </h2>
        )}

        {subtitle && (
          <p className="mx-auto mt-4 max-w-[720px] text-base text-white/90 sm:text-lg">
            {subtitle}
          </p>
        )}

        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <SmartLink
            href={link?.href}
            label={link?.label}
            className="inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-[8px] bg-white px-8 font-semibold text-[#37469e] transition-shadow duration-300 hover:shadow-lg sm:w-auto"
          >
            {link?.label}
            <ArrowRight size={16} aria-hidden="true" />
          </SmartLink>

          <SmartLink
            href={secondaryLink?.href}
            label={secondaryLink?.label}
            className="inline-flex h-[52px] w-full items-center justify-center rounded-[8px] border-2 border-white/70 px-8 font-semibold text-white transition-colors duration-300 hover:bg-white/10 sm:w-auto"
          />
        </div>
      </div>
    </section>
  );
}
