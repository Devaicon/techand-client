import InsightHero from "@/components/insight-page/InsightHero";
import BlogInsights from "@/components/insight-page/BlogInsights";
import FeaturedInsights from "@/components/insight-page/FeaturedInsights";
import { getAllInsights, getFeaturedInsights, toCardModel } from "@/lib/blogs-api";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";

// Cached (ISR) so the CDN can serve the HTML. Publishing or editing a post in
// the admin purges this page straight away (app/api/revalidate); the window is
// only a backstop for changes made any other way.
//
// A literal because Next reads segment config statically; keep it equal to
// REVALIDATE_CONTENT in lib/cache.js.
export const revalidate = 300;

export const metadata = {
  title: "Insights",
  description:
    "Perspectives on AI, Dynamics 365, cloud, and UAE e-invoicing compliance from Tech& — practical guidance for enterprise digital transformation.",
  alternates: { canonical: "/insights" },
};

// Server Component: posts are fetched here and passed down as props, so the
// article list is in the initial HTML (crawlable) while the filter/search UI
// below stays a client component.
export default async function InsightsPage() {
  const [all, featured] = await Promise.all([
    getAllInsights(),
    getFeaturedInsights(),
  ]);

  return (
    <main>
      <BreadcrumbSchema path="/insights" />
      <InsightHero />
      <BlogInsights posts={all.map(toCardModel)} />
      <FeaturedInsights posts={featured.map(toCardModel)} />
    </main>
  );
}
