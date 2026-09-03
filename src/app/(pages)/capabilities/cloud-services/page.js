import CapabilitesContainer from "@/components/capabilities/CapabilitesContainer";
import CapabilitiesHero from "@/components/capabilities/CapabilitiesHero";
import ScrollToHash from "@/components/capabilities/ScrollToHash";
import { CAPABILITIES_CONFIG } from "@/lib/capabilities-data";
import React, { Suspense } from "react";

export const metadata = {
  title: "Cloud Services",
  description:
    "Secure, scalable Azure platforms from Tech& — infrastructure modernization, cost optimization, and stronger security for enterprise workloads in the GCC.",
  alternates: { canonical: "/capabilities/cloud-services" },
};

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
