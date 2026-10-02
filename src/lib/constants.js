/**
 * The site's canonical origin, with no trailing slash.
 *
 * `www` is the host Vercel serves; the bare domain 308-redirects to it. Every
 * canonical tag, sitemap <loc> and schema.org URL is built from this value, so
 * it has to be the host that answers 200 — when it defaulted to the bare domain,
 * every page's canonical pointed at a redirect, which an SEO crawl reports as
 * both "canonical to redirect" and "internal link to redirect" on every URL.
 *
 * NEXT_PUBLIC_SITE_URL still overrides it, so it must be set to the www origin
 * (or left unset) in the Vercel project.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.techand.ai"
).replace(/\/+$/, "");

/**
 * Site configuration constants
 */
export const SITE_CONFIG = {
  name: "Tech&",
  title: "Enterprise Automation & Digital Transformation Solutions",
  description:
    "Empowering enterprise transformation through cutting-edge technology consulting for the UAE & GCC region.",
  url: SITE_URL,
  ogImage: "/og-image.webp",
  links: {
    twitter: "https://twitter.com/Tech&",
    linkedin: "https://www.linkedin.com/company/techand.ai/",
  },
  contact: {
    email: "info@techand.ai",
    phone: "+971-XX-XXX-XXXX",
  },
};

/**
 * Navigation menu items
 */
export const NAVIGATION_ITEMS = [
  { href: "/industries", label: "Industries" },
  { href: "/solutions", label: "Solutions" },
  { href: "/capabilities", label: "Capabilities" },
  { href: "/insights", label: "Insights" },
  { href: "/why-with-Tech&", label: "Why tech&" },
];

/**
 * SEO default values
 */
export const SEO_DEFAULTS = {
  titleTemplate: "%s | Tech&",
  defaultTitle: "Tech& | Enterprise Automation & Digital Transformation",
  description:
    "Empowering enterprise transformation through cutting-edge technology consulting for the UAE & GCC region.",
  keywords: [
    "enterprise automation",
    "digital transformation",
    "technology consulting",
    "UAE technology solutions",
    "GCC digital consulting",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
  },
  twitter: {
    handle: "@Tech&",
    site: "@Tech&",
    cardType: "summary_large_image",
  },
};
