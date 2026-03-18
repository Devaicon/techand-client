import Hero from "@/components/landing/Hero";
import EnterpriseExcellence from "@/components/landing/EnterpriseExcellence";
import IndustriesSection from "@/components/landing/industries/IndustriesSection";
import ServicesSection from "@/components/landing/services/ServicesSection";
import FinancialBacking from "@/components/landing/financial/FinancialBacking";
import Capabilities from "@/components/landing/capabilities/Capabilities";
import Insights from "@/components/landing/insights/Insights";
import ContactSection from "@/components/landing/contact-form/ContactSection";
import TransformationCTASection from "@/components/landing/TransformationCTASection";

export const metadata = {
  title: "Home | Tech&",
  description: "Value Driven Innovation through Automation.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function HomePreview() {
  return (
    <main>
      <Hero />
      <FinancialBacking />
      <IndustriesSection />
      <ServicesSection />
      <EnterpriseExcellence />
      <Capabilities />
      <Insights />
      <TransformationCTASection />
      <ContactSection />
    </main>
  );
}
