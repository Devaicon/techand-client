import InsightHero from "@/components/insight-page/InsightHero";
import BlogInsights from "@/components/insight-page/BlogInsights";
import FeaturedInsights from "@/components/insight-page/FeaturedInsights";
import { getAllInsights, getFeaturedInsights, toCardModel } from "@/lib/blogs-api";

// Render on every request so the list always reflects the latest published
// posts the moment they change in the admin — no ISR window to wait on.
export const dynamic = "force-dynamic";

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
      <InsightHero />
      <BlogInsights posts={all.map(toCardModel)} />
      <FeaturedInsights posts={featured.map(toCardModel)} />
    </main>
  );
}
