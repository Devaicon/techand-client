import CapabilitesContainer from "@/components/capabilities/CapabilitesContainer";
import CapabilitiesHero from "@/components/capabilities/CapabilitiesHero";
import ScrollToHash from "@/components/capabilities/ScrollToHash";
import { CAPABILITIES_CONFIG } from "@/lib/capabilities-data";
import React, { Suspense } from "react";

const page = () => {
  const cloudConfig = CAPABILITIES_CONFIG["cloud-services"];

  return (
    <main>
      <Suspense fallback={null}>
        <ScrollToHash />
      </Suspense>
      <CapabilitiesHero />
      <CapabilitesContainer
        title={cloudConfig.title}
        subtitle={cloudConfig.subtitle}
        cards={cloudConfig.cards}
        showGroups={true}
      />
    </main>
  );
};

export default page;
