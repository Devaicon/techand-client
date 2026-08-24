import Image from "next/image";
import Breadcrumb from "@/components/shared/Breadcrumb";
import { PAGE_INSET } from "./layout";

// next/image throws on an empty src, so a page saved before its background was
// chosen would take the whole route down rather than just looking unfinished.
const FALLBACK_IMAGE = "/contact-page-heroimg.webp";

/**
 * The compact page header — half the viewport, growing taller when a long title
 * needs the room.
 *
 * This is `GenericHero` as a block. The two are deliberately separate files
 * rather than one shared component: `GenericHero` is called directly by the
 * hand-written routes (/insights, /capabilities, blog posts) with plain string
 * props, while this one reads an author's image object with its crop correction.
 * Folding them together would mean one component with two prop dialects, and
 * every future change to either would have to be reasoned about twice.
 *
 * They must stay visually identical, and `PAGE_INSET` is what keeps them so —
 * it is the same inset GenericHero uses, so a heading below this block lines up
 * with the title inside it.
 *
 * The asymmetric top padding and the h1 ramp are GenericHero's, verbatim. The
 * site header is `fixed` and nothing below it reserves room, so it floats over
 * the top 80px (93px from xl) of this section — vertical centring alone slid the
 * breadcrumb up under the navbar whenever the content was short. The padding is
 * a floor the content cannot cross; the section grows taller instead. The h1
 * stops at `md:text-5xl` rather than `lg:text-6xl` for the same reason it does
 * on a blog post: 60px of title pushes the trail above it into the navbar.
 *
 * `overlapRoom` adds that many pixels of background below the (vertically
 * centred) content, giving the `header-panel` block's card room to rise onto the
 * photo rather than over the title. Unset it changes nothing.
 */
export default function HeaderShort({ props, overlapRoom = 0 }) {
  const { title, subtitle, image, showBreadcrumb, dim } = props;

  return (
    <section
      className="relative flex w-full items-center overflow-hidden pb-16 pt-28 xl:pt-36 min-h-[clamp(380px,56vh,620px)]"
      style={overlapRoom > 0 ? { paddingBottom: `calc(4rem + ${overlapRoom}px)` } : undefined}
    >
      <Image
        src={image?.url || FALLBACK_IMAGE}
        alt={image?.alt || title || ""}
        fill
        priority
        className="object-cover brightness-[1.05] contrast-[1.15] saturate-[1.1]"
        style={{
          objectPosition: image?.focus || "center",
          transform: image?.zoom > 1 ? `scale(${image.zoom})` : undefined,
        }}
      />

      <div
        className="absolute inset-0 mix-blend-multiply"
        style={{
          background:
            "linear-gradient(180deg, rgba(69, 85, 167, 1) 0%, rgba(83, 64, 107, 1) 100%)",
        }}
      />

      {/* Optional heavy scrim — knocks the background image back so it reads as
          a faint texture rather than a photo. */}
      {dim > 0 && (
        <div
          className="absolute inset-0"
          style={{ backgroundColor: `rgba(40, 32, 61, ${dim})` }}
        />
      )}

      <div className={`relative z-10 w-full ${PAGE_INSET}`}>
        {showBreadcrumb !== false && <Breadcrumb currentLabel={title} />}
        {/* `break-words`: the section clips its overflow, so a long unbroken
            title would be cut off rather than wrapped. */}
        <h1 className="mb-3 break-words text-3xl font-bold leading-tight text-white sm:mb-4 sm:text-4xl md:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="max-w-5xl break-words text-base text-white/90 sm:text-lg md:text-xl">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
