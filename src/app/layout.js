import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SiteChrome from "@/components/layout/SiteChrome";
import ComingSoon from "@/components/coming-soon/ComingSoon";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
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

const GA_ID = "G-Q6D2L7R28G";

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
        {/* Blog images are real page content, so their origin gets a full
            preconnect — DNS + TLS overlap the HTML parse instead of being paid
            for at first request.
            
            The two analytics origins get dns-prefetch only. Both scripts are
            now deliberately held until after load (see the GA and Apollo tags
            at the end of the body); a preconnect would spend a connection
            during the load it is being kept out of, which is the opposite of
            the intent. Resolving DNS early is free and still helps. */}
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://assets.apollo.io" />
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
        {/* Google Analytics, hand-rolled rather than via
            @next/third-parties' <GoogleAnalytics>, for one reason: that
            component hardcodes strategy="afterInteractive" and exposes no way
            to change it. afterInteractive also makes Next emit a
            <link rel="preload" as="script"> for gtag.js, so 166 KiB of
            analytics was being fetched at elevated priority alongside the hero
            image it competes with.
            
            Split in two on purpose. The init below is inline and costs no
            network: it defines dataLayer and pushes the pageview immediately,
            so the hit is queued from the moment the page is interactive. Only
            the 166 KiB gtag.js fetch is deferred to lazyOnload (after the
            window load event) — when it finally arrives it drains the queue,
            so deferring the download does not drop the pageview. */}
        <Script id="ga-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
        </Script>
        <Script
          id="ga-loader"
          strategy="lazyOnload"
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        />
        {/* Apollo's visitor tracker used to be injected the moment this script
            parsed, which put a third-party request on the critical path before
            the hero image had finished. Nothing about it needs to run during
            load, so it is held until the page is idle (or 4s, whichever is
            first) — the tracker still fires on every visit, just after the
            content the visitor came for. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){function initApollo(){var n=Math.random().toString(36).substring(7),o=document.createElement("script");
 o.src="https://assets.apollo.io/micro/website-tracker/tracker.iife.js?nocache="+n,o.async=!0,o.defer=!0,
 o.onload=function(){window.trackingFunctions.onLoad({appId:"6a2be9e9534633001cb874bd"})},
 document.head.appendChild(o)}
 if(typeof window.requestIdleCallback==="function"){window.requestIdleCallback(initApollo,{timeout:4000})}
 else{window.addEventListener("load",function(){setTimeout(initApollo,1500)},{once:true})}})();`,
          }}
        />
      </body>
    </html>
  );
}
