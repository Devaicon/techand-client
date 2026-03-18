import CapabilitesContainer from "@/components/capabilities/CapabilitesContainer";
import GenericHero from "@/components/shared/GenericHero";
import ScrollToHash from "@/components/capabilities/ScrollToHash";
import { WHATWEDO_CONFIG } from "@/lib/whatwedo-data";
import React, { Suspense } from "react";

export const metadata = {
  title: "Assess & Envision | What We Do",
  description:
    "We analyze your current business challenges and develop a comprehensive plan to achieve your future technology objectives.",
};

const page = () => {
  const whatWeDoConfig = WHATWEDO_CONFIG.main;

  return (
    <main>
      <Suspense fallback={null}>
        <ScrollToHash />
      </Suspense>
      <GenericHero
        title="Assess & Envision"
        subtitle="Analyze challenges and develop comprehensive technology plans"
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
