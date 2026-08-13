import Image from "next/image";
import Breadcrumb from "@/components/shared/Breadcrumb";

/**
 * GenericHero Component
 * Reusable hero section for any page. Fills just over half the viewport height,
 * growing taller when the content (e.g. a long blog title) needs the room.
 * @param {Object} props
 * @param {string} props.title - Main heading
 * @param {string} props.subtitle - Subheading
 * @param {string} props.backgroundImage - Background image path
 * @param {string} [props.currentLabel] - Overrides the final breadcrumb crumb's
 *   label (e.g. a blog post title instead of its URL slug)
 * @param {number} [props.dim] - 0–1 strength of an extra dark scrim over the
 *   background image, for when the image should be only faintly visible
 */
const GenericHero = ({
  title = "Tech& Solutions",
  subtitle = "Enterprise platforms and integration services",
  backgroundImage = "/contact-page-heroimg.webp",
  currentLabel,
  dim = 0,
}) => {
  return (
    // The site header is `fixed` and nothing below it reserves room, so it
    // floats over the top 80px (93px from xl) of this section. The asymmetric
    // top padding is that clearance: content is vertically centred, so on a tall
    // hero — a long blog title, a breadcrumb that wraps — centring alone would
    // slide the first line up under the navbar. Padding sets a floor it cannot
    // cross, and pushes the section taller instead.
    <section className="relative flex w-full items-center overflow-hidden pb-16 pt-28 xl:pt-36 min-h-[clamp(380px,56vh,620px)]">
      {/* Background Image */}
      <Image
        src={backgroundImage}
        alt={title}
        fill
        priority
        className="object-cover brightness-[1.05] contrast-[1.15] saturate-[1.1]"
      />

      {/* Gradient Overlay */}
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

      {/* Content */}
      <div className="relative z-10 w-full px-6 sm:px-12 md:px-16 lg:px-24 xl:px-32">
        <Breadcrumb currentLabel={currentLabel} />
        <h1 className="text-xl lg:text-5xl font-bold text-white mb-3 sm:mb-4">
          {title}
        </h1>
        {subtitle && (
          <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-5xl">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
};

export default GenericHero;
