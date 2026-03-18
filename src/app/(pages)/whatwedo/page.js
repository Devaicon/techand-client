import CapabilitesContainer from "@/components/capabilities/CapabilitesContainer";
import GenericHero from "@/components/shared/GenericHero";
import ScrollToHash from "@/components/capabilities/ScrollToHash";
import { WHATWEDO_CONFIG } from "@/lib/whatwedo-data";
import React, { Suspense } from "react";

export const metadata = {
  title: "What We Do",
  description:
    "We guide your business through every step of technology growth to ensure you stay ahead of competitors.",
  keywords: [
    "technology consulting",
    "digital transformation",
    "business automation",
    "implementation services",
    "managed services",
    "AI automation",
  ],
};

const page = () => {
  const whatWeDoConfig = WHATWEDO_CONFIG.main;

  return (
    <main>
      <Suspense fallback={null}>
        <ScrollToHash />
      </Suspense>
      <GenericHero
        title="What We Do"
        subtitle="We guide your business through every step of technology growth"
        backgroundImage="/contact-page-heroimg.webp"
      />
      <CapabilitesContainer
        title={whatWeDoConfig.title}
        subtitle={whatWeDoConfig.subtitle}
        cards={whatWeDoConfig.cards}
        showGroups={true}
        hideBadge={true}
      />
    </main>
  );
};

export default page;
