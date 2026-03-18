import CapabilitesContainer from "@/components/capabilities/CapabilitesContainer";
import GenericHero from "@/components/shared/GenericHero";
import ScrollToHash from "@/components/capabilities/ScrollToHash";
import { WHATWEDO_CONFIG } from "@/lib/whatwedo-data";
import React, { Suspense } from "react";

export const metadata = {
  title: "Build & Implement | What We Do",
  description:
    "Our team develops your custom software and installs the right Microsoft tools to make your work easier.",
};

const page = () => {
  const whatWeDoConfig = WHATWEDO_CONFIG.main;

  return (
    <main>
      <Suspense fallback={null}>
        <ScrollToHash />
      </Suspense>
      <GenericHero
        title="Build & Implement"
        subtitle="Custom software development and Microsoft tools implementation"
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
