import Link from "next/link";
import { ArrowRight } from "lucide-react";
/**
 * HeroSlide - A reusable slide component for the hero carousel
 *
 * @param {string} backgroundImage - URL/path to the background image
 * @param {string} title - Main heading text for the slide
 * @param {string} description - Description text for the slide
 * @param {Object} primaryButton - Primary button config {text, href}
 * @param {Object} secondaryButton - Secondary button config {text, href}
 */
export default function HeroSlide({
  backgroundImage,
  title,
  description,
  primaryButton,
  secondaryButton,
}) {
  return (
    <div
      className="relative flex items-center overflow-hidden w-full h-[500px] sm:h-[600px] md:h-[calc(100vh-40px)] lg:h-[calc(100vh-46px)] xl:h-[calc(100vh-46px)] 2xl:h-[700px]"
      style={{
        backgroundImage: `url('${backgroundImage}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
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
            <h1 className="font-bold text-white mb-4 sm:mb-6 text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight lg:leading-[1.2]">
              {title}
            </h1>

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
