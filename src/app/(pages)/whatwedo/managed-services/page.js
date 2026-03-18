import CapabilitesContainer from "@/components/capabilities/CapabilitesContainer";
import GenericHero from "@/components/shared/GenericHero";
import ScrollToHash from "@/components/capabilities/ScrollToHash";
import { WHATWEDO_CONFIG } from "@/lib/whatwedo-data";
import React, { Suspense } from "react";

export const metadata = {
  title: "Managed Services | What We Do",
  description:
    "Our experts handle your daily IT needs, allowing your staff to focus on major projects without technical stress.",
};

const page = () => {
  const whatWeDoConfig = WHATWEDO_CONFIG.main;

  return (
    <main>
      <Suspense fallback={null}>
        <ScrollToHash />
      </Suspense>
      <GenericHero
        title="Managed Services"
        subtitle="Expert IT management for your daily needs"
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
