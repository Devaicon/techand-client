import CapabilitesContainer from "@/components/capabilities/CapabilitesContainer";
import GenericHero from "@/components/shared/GenericHero";
import ScrollToHash from "@/components/capabilities/ScrollToHash";
import { WHATWEDO_CONFIG } from "@/lib/whatwedo-data";
import React, { Suspense } from "react";

export const metadata = {
  title: "Global Rollouts | What We Do",
  description:
    "We take your business solutions and launch them safely across different countries and many new office locations.",
};

const page = () => {
  const whatWeDoConfig = WHATWEDO_CONFIG.main;

  return (
    <main>
      <Suspense fallback={null}>
        <ScrollToHash />
      </Suspense>
      <GenericHero
        title="Global Rollouts"
        subtitle="Launch solutions safely across different countries"
        backgroundImage="/contact-page-heroimg.webp"
      />
      <CapabilitesContainer
        title={whatWeDoConfig.title}
        subtitle={whatWeDoConfig.subtitle}
        cards={whatWeDoConfig.cards}
        showGroups={false}
        hideBadge={true}
      />
    </main>
  );
};

export default page;
