import Link from "next/link";
import { ArrowRight } from "lucide-react";
/**
 * HeroSlide - A reusable slide component for the hero carousel
 *
 * @param {string} backgroundImage - URL/path to the background image
 * @param {string} backgroundSrcSet - Optional `srcset` for the background, so a
 *   phone downloads the 828px encode instead of the 1920px one.
 * @param {string} title - Main heading text for the slide
 * @param {string} description - Description text for the slide
 * @param {Object} primaryButton - Primary button config {text, href}
 * @param {Object} secondaryButton - Secondary button config {text, href}
 * @param {boolean} priority - True for the slide visible on load. Its image is
 *   the page's LCP element, so it is fetched eagerly at high priority; every
 *   other slide defers.
 * @param {boolean} showImage - Whether to put the image in the DOM at all. The
 *   carousel keeps this false for slides the visitor has not reached yet, which
 *   is what stops all four backgrounds from downloading during first paint.
 * @param {number} headingLevel - 1 for the slide that carries the page's H1,
 *   2 for the rest. Every slide is in the DOM at once, so without this the
 *   carousel emits one H1 per slide and the page has no single title for a
 *   crawler or an assistive technology to anchor on. Defaults to 2 so a new
 *   caller cannot accidentally introduce a second H1.
 */
export default function HeroSlide({
  backgroundImage,
  backgroundSrcSet,
  title,
  description,
  primaryButton,
  secondaryButton,
  priority = false,
  showImage = true,
  headingLevel = 2,
}) {
  // Styling is identical either way — this changes the document outline, not
  // the design.
  const Heading = headingLevel === 1 ? "h1" : "h2";

  return (
    <div className="relative flex items-center overflow-hidden w-full h-[500px] sm:h-[600px] md:h-[calc(100vh-40px)] lg:h-[calc(100vh-46px)] xl:h-[calc(100vh-46px)] 2xl:h-[700px] bg-[#4555A7]">
      {/* A real <img> rather than a CSS background: the preload scanner can
          find it in the raw HTML and start the LCP fetch before any stylesheet
          has parsed. Plain <img> and not next/image because `images.unoptimized`
          is on, so next/image would emit the same single-size <img> without the
          srcset written out below. */}
      {showImage && (
        // eslint-disable-next-line @next/next/no-img-element -- deliberate: see above
        <img
          src={backgroundImage}
          srcSet={backgroundSrcSet}
          sizes="100vw"
          alt=""
          aria-hidden="true"
          fetchPriority={priority ? "high" : "low"}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {/* Gradient overlay - Linear gradient from #4555A7 (top) to #53406B (bottom) */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to bottom, #4555A7, #53406B)",
          opacity: 0.85,
        }}
        aria-hidden="true"
      />

      <div className="w-full h-full relative z-10 flex items-center justify-center">
        <div className="w-full lg:w-[calc(100%-280px)] max-w-[1639px] mx-auto px-4 sm:px-8 lg:px-6 xl:px-[59px] pt-6 md:pt-10 lg:pt-12 xl:pt-16">
          <div className="max-w-full sm:max-w-[600px] lg:max-w-[900px]">
            {/* Main Heading */}
            <Heading className="font-bold text-white mb-4 sm:mb-6 text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight lg:leading-[1.2]">
              {title}
            </Heading>

            {/* Description */}
            <p
              className="text-white mb-6 text-base sm:text-lg lg:text-[20px] leading-relaxed lg:leading-[1.6]"
              dangerouslySetInnerHTML={{ __html: description }}
            />

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6 sm:mt-9">
              {primaryButton && (
                <Link
                  href={primaryButton.href}
                  className="group inline-flex items-center justify-center gap-2 bg-black text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded hover:bg-gray-900 hover:scale-105 transition-all duration-300 text-sm font-medium"
                >
                  <span>{primaryButton.text}</span>
                  {/* "Read More" on its own tells a crawler (and anyone
                      tabbing through a list of links) nothing about where it
                      goes. The slide title is appended out of sight so the
                      link reads "Read More about <slide title>" while the
                      button still shows two words. */}
                  <span className="sr-only"> about {title}</span>
                  <ArrowRight
                    size={16}
                    className="mt-1 transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>
              )}
              {secondaryButton && (
                <Link
                  href={secondaryButton.href}
                  className="inline-flex items-center justify-center bg-white text-gray-900 px-6 sm:px-8 py-3 sm:py-3.5 rounded hover:bg-gray-100 hover:scale-105 transition-all duration-300 text-sm font-medium"
                >
                  {secondaryButton.text}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
