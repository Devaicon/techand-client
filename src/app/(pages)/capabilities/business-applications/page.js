import CapabilitesContainer from "@/components/capabilities/CapabilitesContainer";
import CapabilitiesHero from "@/components/capabilities/CapabilitiesHero";
import ScrollToHash from "@/components/capabilities/ScrollToHash";
import { CAPABILITIES_CONFIG } from "@/lib/capabilities-data";
import React, { Suspense } from "react";

export const metadata = {
  title: "Business Applications",
  description:
    "Dynamics 365 across finance, operations, sales, and service — Tech& connects your enterprise into one intelligent system for measurable efficiency.",
  alternates: { canonical: "/capabilities/business-applications" },
};

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
