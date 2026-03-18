import CapabilitesContainer from "@/components/capabilities/CapabilitesContainer";
import CapabilitiesHero from "@/components/capabilities/CapabilitiesHero";
import ScrollToHash from "@/components/capabilities/ScrollToHash";
import { CAPABILITIES_CONFIG } from "@/lib/capabilities-data";
import React, { Suspense } from "react";

const page = () => {
  const businessConfig = CAPABILITIES_CONFIG["business-applications"];

  return (
    <main>
      <Suspense fallback={null}>
        <ScrollToHash />
      </Suspense>
      <CapabilitiesHero />
      <CapabilitesContainer
        title={businessConfig.title}
        subtitle={businessConfig.subtitle}
        cards={businessConfig.cards}
        showGroups={true}
      />
    </main>
  );
};

export default page;
