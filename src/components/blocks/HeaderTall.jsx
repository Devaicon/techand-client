import Image from "next/image";
import { ArrowRight } from "lucide-react";
import Breadcrumb from "@/components/shared/Breadcrumb";
import SmartLink from "./SmartLink";
import { PAGE_INSET } from "./layout";

/**
 * The tall page header from the reference: an eyebrow, a headline, a
 * supporting line, body copy and up to two buttons over the brand gradient.
 *
 * The two blurred colour orbs are the reference's, and they are decorative —
 * `aria-hidden`, no content, and they sit behind everything. On a narrow screen
 * they are the only thing that keeps a plain gradient from reading as flat.
 *
 * The top padding is heavier than the bottom on purpose. The site header is
 * `fixed` and nothing below it reserves room, so it floats over the top 80px
 * (93px from xl) of this section; at an even `py-20` the breadcrumb landed
 * behind it. `pt-28 xl:pt-36` matches GenericHero — the header the blog posts
 * and /insights use — so every header on the site clears the navbar by the same
 * margin, and the h1 stops at the same `md:text-5xl` instead of running on to
 * 56px, which made the title tower over its own breadcrumb.
 *
 * `overlapRoom` extends the gradient below the content by that many pixels. It is
 * how the `header-panel` block gives a card room to rise onto clean gradient
 * rather than over the buttons; left unset it changes nothing, so every page that
 * renders this header on its own is untouched.
 */
export default function HeaderTall({ props, overlapRoom = 0 }) {
  const {
    eyebrow,
    headline,
    subheading,
    body,
    image,
    primary,
    secondary,
    showBreadcrumb,
  } = props;

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-[#4653a2] via-[#52426f] to-[#683b80]">
      {/* Optional photograph, knocked well back so the copy stays legible over
          whatever an author uploads. */}
      {image?.url && (
        <Image
          src={image.url}
          alt={image.alt || ""}
          fill
          priority
          className="object-cover opacity-25"
          style={{
            objectPosition: image.focus || "center",
            transform: image.zoom > 1 ? `scale(${image.zoom})` : undefined,
          }}
        />
      )}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 -top-32 h-[484px] w-[484px] rounded-full bg-[#4653a2]/30 blur-[174px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -right-24 h-[392px] w-[392px] rounded-full bg-[#683b80]/35 blur-[186px]"
      />

      <div
        className={`relative z-10 w-full pb-20 pt-36 md:pb-28 xl:pt-42 ${PAGE_INSET}`}
      >
        {showBreadcrumb !== false && <Breadcrumb currentLabel={headline} />}

        {/* Every text node below breaks on words rather than overflowing. The
            section clips what leaves it, so an unbroken run — a long product
            name, a URL pasted into a heading — used to be silently cut off at
            the edge instead of wrapping. */}
        {eyebrow && (
          <span className="mb-4 inline-block max-w-full break-words rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-[13px] font-semibold uppercase tracking-wide text-white/90">
            {eyebrow}
          </span>
        )}

        <h1 className="max-w-[900px] break-words text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
          {headline}
        </h1>

        {subheading && (
          <p className="mt-4 max-w-[820px] break-words text-lg font-semibold text-white/90 md:text-xl">
            {subheading}
          </p>
        )}

        {body && (
          <p className="mt-4 max-w-[760px] break-words text-base leading-7 text-white/80 md:text-lg">
            {body}
          </p>
        )}

        {/* SmartLink renders nothing for a link with no destination, so this is
            a two-button row, a one-button row or no row at all without a guard
            per button.

            `flex-wrap` and a minimum height rather than a fixed one: two long
            labels side by side overflowed the row, and a label that wrapped to
            two lines overflowed a 52px button. */}
        <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:flex-wrap sm:items-stretch">
          <SmartLink
            href={primary?.href}
            label={primary?.label}
            className="inline-flex min-h-[52px] w-full max-w-full items-center justify-center gap-2 rounded-[8px] bg-white px-8 py-3 text-center font-semibold text-[#37469e] transition-shadow duration-300 hover:shadow-lg sm:w-auto"
          >
            {primary?.label}
            <ArrowRight size={16} className="shrink-0" aria-hidden="true" />
          </SmartLink>

          <SmartLink
            href={secondary?.href}
            label={secondary?.label}
            className="inline-flex min-h-[52px] w-full max-w-full items-center justify-center rounded-[8px] border-2 border-white/70 px-8 py-3 text-center font-semibold text-white transition-colors duration-300 hover:bg-white/10 sm:w-auto"
          />
        </div>
      </div>

      {/* Extra gradient below the content for an overlapping card to sit on. A
          spacer rather than bottom padding on the content wrapper, so it does not
          fight the responsive `py-*` above. */}
      {overlapRoom > 0 && (
        <div aria-hidden="true" style={{ height: overlapRoom }} />
      )}
    </section>
  );
}
