/**
 * Site configuration constants
 */
export const SITE_CONFIG = {
  name: "Tech&",
  title: "Enterprise Automation & Digital Transformation Solutions",
  description:
    "Empowering enterprise transformation through cutting-edge technology consulting for the UAE & GCC region.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://Tech&.com",
  ogImage: "/og-image.webp",
  links: {
    twitter: "https://twitter.com/Tech&",
    linkedin: "https://www.linkedin.com/company/Tech&",
  },
  contact: {
    email: "info@Tech&.com",
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
  { href: "/why-with-Tech&", label: "Why With Tech&" },
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
