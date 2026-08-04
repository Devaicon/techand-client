import Image from "next/image";
import { ArrowRight } from "lucide-react";
import SmartLink from "./SmartLink";
import { PAGE_INSET } from "./layout";

/**
 * A full-width statement band, over the brand gradient or a photograph.
 *
 * When an image is set it sits under a gradient scrim rather than replacing it:
 * the scrim is what guarantees the copy stays legible over whatever an author
 * uploads, and "the text disappeared on this photo" is not a failure mode worth
 * leaving open.
 */
export default function Banner({ props }) {
  const {
    heading,
    body,
    image,
    link,
    secondaryLink,
    tertiaryLink,
    align,
    layout,
  } = props;
  const centred = align !== "left";

  const buttons = (justify) => (
    <div className={`mt-8 flex flex-col gap-4 sm:flex-row ${justify}`}>
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

      {/* Third button reads as the quietest of the three — the design's bands
          offer a demo, a sales conversation and, trailing them, a link for
          someone not ready to talk to anyone yet. */}
      <SmartLink
        href={tertiaryLink?.href}
        label={tertiaryLink?.label}
        className="inline-flex h-[52px] w-full items-center justify-center px-4 font-semibold text-white/80 underline-offset-4 transition-colors duration-300 hover:text-white hover:underline sm:w-auto"
      />
    </div>
  );

  if (layout === "split") {
    return (
      <section className="bg-gradient-to-r from-[#4c4168] to-[#454f8e]">
        <div className={`py-14 md:py-20 ${PAGE_INSET}`}>
          <div
            className={`mx-auto grid w-full max-w-[1180px] items-center gap-8 ${
              image?.url ? "lg:grid-cols-2 lg:gap-12" : ""
            }`}
          >
            {/* Glass, not a solid card: the gradient behind it is the band's
                only decoration, and a filled panel would cover the part of it
                the eye is drawn to. */}
            <div className="rounded-[20px] border border-white/15 bg-white/10 p-8 backdrop-blur-sm md:p-10">
              <h2 className="text-2xl font-bold leading-snug text-white sm:text-[28px]">
                {heading}
              </h2>
              {body && (
                <p className="mt-4 text-base leading-8 text-white/85">{body}</p>
              )}
              {(link?.href || secondaryLink?.href || tertiaryLink?.href) &&
                buttons("")}
            </div>

            {image?.url && (
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[16px] shadow-xl">
                <Image
                  src={image.url}
                  alt={image.alt || ""}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  style={{ objectPosition: image.focus || "center" }}
                />
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-[#4c4168] to-[#454f8e]">
      {image?.url && (
        <>
          <Image
            src={image.url}
            alt={image.alt || ""}
            fill
            sizes="100vw"
            className="object-cover"
            style={{ objectPosition: image.focus || "center" }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-[#4c4168]/90 to-[#454f8e]/80"
          />
        </>
      )}

      <div className={`relative z-10 py-14 md:py-20 ${PAGE_INSET}`}>
        <div
          className={`mx-auto w-full max-w-[900px] ${
            centred ? "text-center" : "text-left"
          }`}
        >
          <h2 className="text-2xl font-bold leading-snug text-white sm:text-3xl md:text-[38px]">
            {heading}
          </h2>

          {body && (
            <p
              className={`mt-4 max-w-[720px] text-base leading-7 text-white/85 sm:text-lg ${
                centred ? "mx-auto" : ""
              }`}
            >
              {body}
            </p>
          )}

          {buttons(centred ? "sm:justify-center" : "")}
        </div>
      </div>
    </section>
  );
}
