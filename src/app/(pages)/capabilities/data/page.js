import CapabilitesContainer from "@/components/capabilities/CapabilitesContainer";
import CapabilitiesHero from "@/components/capabilities/CapabilitiesHero";
import ScrollToHash from "@/components/capabilities/ScrollToHash";
import { CAPABILITIES_CONFIG } from "@/lib/capabilities-data";
import React, { Suspense } from "react";

export const metadata = {
  title: "Data & Analytics",
  description:
    "Turn scattered data into decision-ready insight with Microsoft Fabric, analytics, and governance — a single source of truth for GCC enterprises.",
  alternates: { canonical: "/capabilities/data" },
};

const page = () => {
  const dataConfig = CAPABILITIES_CONFIG.data;

  return (
    <main>
      <Suspense fallback={null}>
        <ScrollToHash />
      </Suspense>
      <CapabilitiesHero />
      <CapabilitesContainer
        title={dataConfig.title}
        subtitle={dataConfig.subtitle}
        cards={dataConfig.cards}
        showGroups={true}
      />
    </main>
  );
};

export default page;
