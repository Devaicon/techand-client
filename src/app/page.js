import Hero from "@/components/landing/Hero";
import EnterpriseExcellence from "@/components/landing/EnterpriseExcellence";
import IndustriesSection from "@/components/landing/industries/IndustriesSection";
import ServicesSection from "@/components/landing/services/ServicesSection";
import FinancialBacking from "@/components/landing/financial/FinancialBacking";
import Capabilities from "@/components/landing/capabilities/Capabilities";
import Insights from "@/components/landing/insights/Insights";
import ContactSection from "@/components/landing/contact-form/ContactSection";
import TransformationCTASection from "@/components/landing/TransformationCTASection";
import ComingSoon from "@/components/coming-soon/ComingSoon";

// Determine if the "Coming Soon" page should be displayed based on environment variable and API response
const isComingSoonEnabled =
  process.env.NEXT_PUBLIC_SHOW_COMING_SOON?.toLowerCase() === "true";

const shouldRenderComingSoon = async () => {
  if (!isComingSoonEnabled) return false;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return false;

  try {
    const response = await fetch(`${apiUrl}/comingsoon`, { cache: "no-store" });
    if (!response.ok) return false;

    const data = await response.json();
    const launchTime = new Date(data?.launchDate).getTime();

    if (Number.isNaN(launchTime)) return false;

    return Date.now() < launchTime;
  } catch {
    return false;
  }
};

export const metadata = {
  title: "Tech& | Your Technology Partner for Digital Transformation",
  description:
    "Empowering businesses with innovative technology solutions for enterprise automation and digital transformation across UAE and GCC.",
  keywords: [
    "enterprise automation",
    "digital transformation",
    "technology consulting",
    "UAE technology solutions",
    "GCC digital consulting",
    "business automation",
    "enterprise software",
    "innovation consulting",
  ],
  openGraph: {
    title: "Tech& | Your Technology Partner",
    description:
      "Empowering businesses with innovative technology solutions for enterprise automation and digital transformation.",
    url: "/",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.webp",
        width: 1200,
        height: 630,
        alt: "Tech& - Your Technology Partner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tech& | Your Technology Partner",
    description: "Empowering businesses with innovative technology solutions.",
    images: ["/twitter-image.webp"],
  },
  alternates: {
    canonical: "/",
  },
};

export default async function Home() {
  const showComingSoon = await shouldRenderComingSoon();

  if (showComingSoon) {
    return <ComingSoon />;
  }

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
