import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SiteChrome from "@/components/layout/SiteChrome";
import ComingSoon from "@/components/coming-soon/ComingSoon";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { getNavbar } from "@/lib/navbar-api";

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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://techand.ai";

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
  },
  twitter: {
    card: "summary_large_image",
    title: "Tech& | Enterprise Automation & Digital Transformation",
    description:
      "Empowering enterprise transformation through cutting-edge technology consulting.",
    creator: "@Techand",
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
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/techand1.png",
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
  // Both calls hit the same API and neither depends on the other, so they run
  // together rather than adding two round trips to every render.
  //
  // The navbar is fetched HERE, on the server, so the CMS navigation ships in
  // the initial HTML. SiteChrome is a client component and used to fetch it
  // itself after hydration, which left every CMS page unreachable by link for
  // anything that does not run JavaScript — crawlers and agents included.
  // `getNavbar` returns null on failure, and SiteChrome falls back to its
  // built-in menu exactly as before.
  const [isComingSoon, menu] = await Promise.all([
    shouldRenderComingSoon(),
    getNavbar(),
  ]);

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link
          rel="icon"
          href="/favicon/favicon.ico"
          sizes="any"
          type="image/x-icon"
          media="(prefers-color-scheme: light)"
        />
        <link
          rel="icon"
          href="/footer_logo.svg"
          sizes="any"
          type="image/svg+xml"
          media="(prefers-color-scheme: dark)"
        />
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
          <SiteChrome initialMenu={menu}>{children}</SiteChrome>
        )}
        <Analytics />
        <SpeedInsights />
        <GoogleAnalytics gaId="G-Q6D2L7R28G" />
        <script
          dangerouslySetInnerHTML={{
            __html: `function initApollo(){var n=Math.random().toString(36).substring(7),o=document.createElement("script");
 o.src="https://assets.apollo.io/micro/website-tracker/tracker.iife.js?nocache="+n,o.async=!0,o.defer=!0,
 o.onload=function(){window.trackingFunctions.onLoad({appId:"6a2be9e9534633001cb874bd"})},
 document.head.appendChild(o)}initApollo();`,
          }}
        />
      </body>
    </html>
  );
}
