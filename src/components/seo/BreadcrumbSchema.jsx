import JsonLd from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/constants";
import { buildBreadcrumbSchema } from "@/lib/structuredData.mjs";

// The page's BreadcrumbList.
//
// Placed by each route with its own path, rather than derived from the URL in a
// shared layout: a layout never learns the pathname on the server, and the
// routes whose last crumb matters most — an article, a CMS page — are the ones
// that know their real title. See buildBreadcrumbSchema for the trail rules.
export default function BreadcrumbSchema({ path, currentLabel }) {
  return (
    <JsonLd
      schema={buildBreadcrumbSchema(path, { siteUrl: SITE_URL, currentLabel })}
    />
  );
}
