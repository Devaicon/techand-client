"use client";

import { useState, useEffect } from "react";
import HeroSlide from "./HeroSlide";

/**
 * HeroCarousel - Container component for the hero slider/carousel
 *
 * @param {Array} slides - Array of slide objects with structure:
 *   {
 *     backgroundImage: string,
 *     title: string,
 *     description: string,
 *     primaryButton: { text: string, href: string },
 *     secondaryButton: { text: string, href: string }
 *   }
 * @param {number} autoplayInterval - Time in ms between auto-transitions (default: 5000)
 * @param {boolean} autoplay - Enable/disable autoplay (default: true)
 */
export default function HeroCarousel({
  slides,
  autoplayInterval = 5000,
  autoplay = true,
}) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance slides
  useEffect(() => {
    if (!autoplay || slides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, autoplayInterval);

    return () => clearInterval(timer);
  }, [currentSlide, autoplay, autoplayInterval, slides.length]);

  // Navigate to specific slide
  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Navigate to previous slide
  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Navigate to next slide
  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  if (!slides || slides.length === 0) {
    return null;
  }

  return (
    <section
      className="relative"
      aria-label="Hero carousel"
      role="region"
      aria-roledescription="carousel"
    >
      {/* Slides Container */}
      <div className="relative overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`transition-opacity duration-700 ${
              index === currentSlide
                ? "opacity-100"
                : "opacity-0 absolute top-0 left-0 w-full"
            }`}
            aria-hidden={index !== currentSlide}
          >
            <HeroSlide
              backgroundImage={slide.backgroundImage}
              title={slide.title}
              description={slide.description}
              primaryButton={slide.primaryButton}
              secondaryButton={slide.secondaryButton}
            />
          </div>
        ))}
      </div>

      {/* Navigation Arrows - Only show if more than 1 slide */}
      {/* {slides.length > 1 && (
        <>
          
          <button
            onClick={goToPrevious}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 sm:p-3 rounded-full transition-all"
            aria-label="Previous slide"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            onClick={goToNext}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 sm:p-3 rounded-full transition-all"
            aria-label="Next slide"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </>
      )} */}

      {/* Progress Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 sm:bottom-8 left-0 right-0 z-20 flex justify-center">
          <div className="w-full lg:w-[calc(100%-280px)] max-w-[1639px] px-4 sm:px-8 lg:px-6 xl:px-[59px]">
            <div className="flex gap-2 sm:gap-2.5">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className="group relative py-3 px-1 cursor-pointer"
                  aria-label={`Go to slide ${index + 1}`}
                  aria-current={index === currentSlide}
                >
                  <span
                    className={`block h-0.5 rounded-full transition-all ${
                      index === currentSlide
                        ? "w-8 sm:w-12 bg-white"
                        : "w-6 sm:w-8 bg-white/30 group-hover:bg-white/50"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
