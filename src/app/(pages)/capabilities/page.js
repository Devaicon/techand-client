import CapabilitesContainer from "@/components/capabilities/CapabilitesContainer";
import GenericHero from "@/components/shared/GenericHero";
import ScrollToHash from "@/components/capabilities/ScrollToHash";
import { CAPABILITIES_CONFIG } from "@/lib/capabilities-data";
import React, { Suspense } from "react";

export const metadata = {
  title: "Capabilities",
  description:
    "Enterprise platforms, AI, cloud, and data services from Tech& — Microsoft-powered capabilities driving measurable transformation across the UAE & GCC.",
  alternates: { canonical: "/capabilities" },
};

const page = () => {
  const aiConfig = CAPABILITIES_CONFIG.ai;

  return (
    <main>
      <Suspense fallback={null}>
        <ScrollToHash />
      </Suspense>
      <GenericHero
        title="Tech& Capabilities"
        subtitle="Enterprise platforms, AI, and integration services"
        backgroundImage="/contact-page-heroimg.webp"
      />
      <CapabilitesContainer
        title={aiConfig.title}
        subtitle={aiConfig.subtitle}
        cards={aiConfig.cards}
        showGroups={true}
      />
    </main>
  );
};

export default page;
