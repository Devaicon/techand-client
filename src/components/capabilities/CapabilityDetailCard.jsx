"use client";

import Image from "next/image";
import {
  ChevronDown,
  DollarSign,
  Building2,
  MapPin,
  Factory,
  Store,
  Briefcase,
  Heart,
  GraduationCap,
  Search,
  Hammer,
  Settings,
  Globe,
  Headphones,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import React from "react";

// Icon mapping for string-based icon names
const iconMap = {
  DollarSign,
  Building2,
  MapPin,
  Factory,
  Store,
  Briefcase,
  Heart,
  GraduationCap,
  Search,
  Hammer,
  Settings,
  Globe,
  Headphones,
  Sparkles,
};

/**
 * CapabilityDetailCard Component
 * Reusable component for displaying capability details
 * Handles both odd and even card layouts dynamically
 *
 * @param {Object} card - Card data object
 * @param {number} index - Card index to determine odd/even styling
 * @param {boolean} hideBadge - Whether to hide the "HOW IT WORKS" badge
 */
const CapabilityDetailCard = ({ card, index, hideBadge = false }) => {
  const [openSolution, setOpenSolution] = useState(false);

  const toggleSolution = () => {
    setOpenSolution((prev) => !prev);
  };

  // Determine if card is odd or even (1-indexed)
  const isOdd = (index + 1) % 2 !== 0;

  // Set background color based on odd/even
  const backgroundColor = isOdd ? "#fef9f3" : "#DCD3FF33";

  // Set border radius - same for all cards
  const imageBorderRadius = {
    borderTopRightRadius: "37.31px",
    borderTopLeftRadius: "37.31px",
  };

  // Check if card has the new structure (Industry Context, Pain Points, Our Approach)
  const hasNewStructure =
    card.industryContext && card.painPoints && card.ourApproach;

  // Get the icon component from the string name
  const IconComponent =
    typeof card.icon === "string" ? iconMap[card.icon] : null;

  return (
    <section
      id={card.id}
      className="w-full py-10 md:py-12 scroll-mt-20"
      style={{ background: backgroundColor }}
    >
      <div className="max-w-8xl mx-auto px-6 sm:px-12 md:px-16 lg:px-24 xl:px-32">
        {/* Main Content Card */}
        <article>
          <div
            className={`grid grid-cols-1 gap-0 ${
              isOdd ? "lg:grid-cols-[65fr_35fr]" : "lg:grid-cols-[35fr_65fr]"
            }`}
          >
            {/* Content Column */}
            <div
              className={`p-6 md:p-8 lg:p-10 flex gap-6 ${
                isOdd ? "order-1" : "order-2"
              }`}
            >
              {/* Icon - Fixed on Left */}
              <div className="flex-shrink-0">
                {IconComponent ? (
                  <div className="w-20 h-20 p-4 bg-white rounded-lg shadow-md flex items-center justify-center">
                    <IconComponent className="w-10 h-10 text-[#4555A7]" />
                  </div>
                ) : (
                  <div className="relative w-20 h-20 p-4 bg-white rounded-lg shadow-md">
                    <Image
                      src={card.icon}
                      alt={card.iconAlt}
                      fill
                      className="object-contain p-2"
                      sizes="80px"
                    />
                  </div>
                )}
              </div>

              {/* All Content on Right */}
              <div className="flex-1 flex flex-col">
                {/* Badge */}
                {!hideBadge && (
                  <span className="inline-block text-xs font-semibold text-[#4555A7] uppercase tracking-wider mb-3">
                    HOW IT WORKS
                  </span>
                )}

                {/* Title */}
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-5">
                  {card.title}
                </h2>

                {hasNewStructure ? (
                  <>
                    {/* Industry Context Section */}
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        Industry Context
                      </h3>
                      <p className="text-gray-600 text-base leading-relaxed">
                        {card.industryContext}
                      </p>
                    </div>

                    {/* Common Pain Points Section */}
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        Common Pain Points
                      </h3>
                      <ul className="space-y-2">
                        {card.painPoints.map((point, idx) => (
                          <li
                            key={idx}
                            className="flex items-start text-gray-600 text-base leading-relaxed"
                          >
                            <span className="text-[#4555A7] mr-2">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Our Approach Section */}
                    <div className="mb-5">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        Our Approach with Dynamics 365
                      </h3>
                      <p className="text-gray-600 text-base leading-relaxed">
                        {card.ourApproach}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Description */}
                    <p className="text-gray-600 text-base leading-relaxed mb-5">
                      {card.description ||
                        `Enterprise platforms, AI, and integration services designed to
                      deliver measurable business outcomes. Enterprise platforms, AI,
                      and integration services designed to deliver measurable business
                      outcomes. Enterprise platforms, AI, and integration services
                      designed to deliver measurable business outcomes. Enterprise
                      platforms, AI, and integration services designed to deliver
                      measurable business outcomes.`}
                    </p>
                  </>
                )}

                {/* Solutions Dropdown */}
                {card.solutionText && (
                  <div className="mb-5 max-w-2xl">
                    <button
                      onClick={toggleSolution}
                      className="w-full flex items-center justify-between py-4 bg-white hover:bg-gray-50 transition-colors border-l-4 border-[#4555A7]"
                      aria-expanded={openSolution}
                      aria-controls={`solution-${card.id}`}
                    >
                      <span className="text-[#4555A7] font-medium text-left text-lg pl-3">
                        {card.title}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 text-gray-400 transition-transform duration-200 mr-4 ${
                          openSolution ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {openSolution && Array.isArray(card.solutionText) && (
                      <div id={`solution-${card.id}`} className="bg-white">
                        {card.solutionText.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between py-3 px-6 border-b border-gray-200 hover:bg-gray-50 transition-colors last:border-b-0"
                          >
                            <span className="text-gray-700 text-sm">
                              {item}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {openSolution && !Array.isArray(card.solutionText) && (
                      <div
                        id={`solution-${card.id}`}
                        className="py-4 bg-gray-50 px-6"
                      >
                        <p className="text-gray-600 text-sm">
                          {card.solutionText ||
                            `Advanced AI and Copilot integration solutions for
                          enterprise workflows, enabling intelligent automation
                          and enhanced productivity across your organization.`}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Additional Content */}
                {!hasNewStructure && (
                  <p className="text-gray-600 text-base leading-relaxed">
                    {card.additionalContent ||
                      `Enterprise platforms, AI, and integration services designed to
                    deliver measurable business outcomes. Enterprise platforms, AI,
                    and integration services designed to deliver measurable business
                    outcomes. Enterprise platforms, AI, and integration services
                    designed to deliver measurable business outcomes. Enterprise
                    platforms, AI, and integration services designed to deliver
                    measurable business outcomes.`}
                  </p>
                )}
              </div>
            </div>

            {/* Image Column */}
            <div
              className={`relative h-64 lg:h-full min-h-[300px] overflow-hidden ${
                isOdd ? "order-2" : "order-1"
              }`}
              style={imageBorderRadius}
            >
              <Image
                src={card.image || "/hero-img.webp"}
                alt={`${card.title} visualization`}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 35vw"
                priority
              />
            </div>
          </div>
        </article>
      </div>
    </section>
  );
};

export default CapabilityDetailCard;
