// this file tell web crawlers which page they can crwal and cannot crawl on the website.
export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://Tech&.com";

  return {
    rules: [
      {
        userAgent: "*", // all web crawlers
        allow: "/",
        disallow: ["/api/", "/admin/", "/_next/", "/private/"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/api/", "/admin/"],
        crawlDelay: 0,
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: ["/api/", "/admin/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
