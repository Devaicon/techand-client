import CapabilitesContainer from "@/components/capabilities/CapabilitesContainer";
import GenericHero from "@/components/shared/GenericHero";
import { getAllIndustries } from "@/lib/industries-data";
import React, { Suspense } from "react";
import ScrollToHash from "@/components/capabilities/ScrollToHash";

/**
 * Industries Page
 * Displays all industries we serve with detailed information
 * Reuses components from capabilities page for consistency
 */
const page = () => {
  const industries = getAllIndustries();

  return (
    <main>
      <Suspense fallback={null}>
        <ScrollToHash />
      </Suspense>
      <GenericHero
        title="Industries We Serve"
        subtitle="Enterprise solutions for organizations across diverse sectors"
        backgroundImage="/contact-page-heroimg.webp"
      />
      <CapabilitesContainer
        title="Industries We Serve"
        subtitle="Tech& provides industry-specific solutions across the UAE and GCC region, helping organizations achieve digital transformation, improve efficiency, and drive measurable business outcomes."
        cards={industries}
        showGroups={true}
        hideBadge={true}
      />
    </main>
  );
};

export default page;
