import CapabilitesGroups from "@/components/capabilities/CapabilitesGroups";
import Capabilities from "@/components/landing/capabilities/Capabilities";
import ContactSection from "@/components/landing/contact-form/ContactSection";
import WhyTechandHero from "@/components/whywith-techand/WhyTechandHero";
import WhyTechandIntro from "@/components/whywith-techand/WhyTechandIntro";
import React from "react";

export const metadata = {
  title: "Why Tech&",
  description:
    "A trusted transformation partner for GCC enterprises — Microsoft, AI, and data platforms that turn technology into measurable business impact.",
  alternates: { canonical: "/whywith-techand" },
};

const page = () => {
  return (
    <main>
      <WhyTechandHero />
      <WhyTechandIntro />
      <Capabilities />
      <CapabilitesGroups />
      <ContactSection />
    </main>
  );
};

export default page;
