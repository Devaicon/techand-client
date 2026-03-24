import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import PartnerContactCard from "@/components/layout/PartnerContactCard";
import Footer from "@/components/layout/Footer";
import ComingSoon from "@/components/coming-soon/ComingSoon";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://withvita.cloud";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Tech& | Enterprise Automation & Digital Transformation Solutions",
    template: "%s | Tech&",
  },
  description:
    "Empowering enterprise transformation through cutting-edge technology consulting and automation solutions for the UAE & GCC region. Value-driven innovation at scale.",
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
  authors: [{ name: "Tech&", url: siteUrl }],
  creator: "Tech&",
  publisher: "Tech&",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    title: "Tech& | Enterprise Automation & Digital Transformation Solutions",
    description:
      "Empowering enterprise transformation through cutting-edge technology consulting for the UAE & GCC region.",
    siteName: "Tech&",
    images: [
      {
        url: "/og-image.webp",
        width: 1200,
        height: 630,
        alt: "Tech& - Enterprise Automation Solutions",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tech& | Enterprise Automation & Digital Transformation",
    description:
      "Empowering enterprise transformation through cutting-edge technology consulting.",
    images: ["/twitter-image.webp"],
    creator: "@Tech&",
  },
  robots: {
    index: true, // Allow indexing
    follow: true, // Allow following links
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  category: "technology",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#5B6FB6" },
    { media: "(prefers-color-scheme: dark)", color: "#2B3352" },
  ],
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Tech&",
  url: siteUrl,
  logo: `${siteUrl}/logo.webp`,
  description:
    "Enterprise automation and digital transformation solutions for UAE & GCC region",
  foundingDate: "2020",
  address: {
    "@type": "PostalAddress",
    addressCountry: "AE",
    addressRegion: "Dubai",
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "sales",
    availableLanguage: ["en", "ar"],
  },
  sameAs: [
    "https://www.linkedin.com/company/techand.ai/",
    "https://twitter.com/Tech&",
  ],
  areaServed: [
    {
      "@type": "Country",
      name: "United Arab Emirates",
    },
    {
      "@type": "Place",
      name: "GCC Region",
    },
  ],
  knowsAbout: [
    "Enterprise Automation",
    "Digital Transformation",
    "Technology Consulting",
  ],
};

// If launch date is still in the future, render the global coming-soon page.
const shouldRenderComingSoon = async () => {
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

export default async function RootLayout({ children }) {
  const isComingSoon = await shouldRenderComingSoon();

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico?v=2" sizes="any" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#5B6FB6" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        {isComingSoon ? (
          <ComingSoon />
        ) : (
          <>
            <Navbar />
            {children}
            <PartnerContactCard />
            <Footer />
          </>
        )}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
