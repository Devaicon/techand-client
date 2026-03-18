import CapabilitesGroups from "@/components/capabilities/CapabilitesGroups";
import Capabilities from "@/components/landing/capabilities/Capabilities";
import ContactSection from "@/components/landing/contact-form/ContactSection";
import VitaHero from "@/components/whywithvita/VitaHero";
import VitaIntro from "@/components/whywithvita/VitaIntro";
import React from "react";

const page = () => {
  return (
    <main>
      <VitaHero />
      <VitaIntro />
      <Capabilities />
      <CapabilitesGroups />
      <ContactSection />
    </main>
  );
};

export default page;
