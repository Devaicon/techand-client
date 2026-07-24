import { getAllInsights, toCardModel } from "@/lib/blogs-api";
import InsightsExplorer from "./InsightsExplorer";

// The home-page teaser shows just the latest few posts; the full catalogue
// lives on /insights.
const HOME_INSIGHTS_LIMIT = 6;

// Server Component: pulls the latest published posts from the CMS so the home
// page stays in sync with /insights instead of a hardcoded list. getAllInsights
// returns [] if the API is unavailable, in which case the client section shows a
// friendly empty state rather than erroring.
export default async function Insights() {
  const posts = await getAllInsights();

  // Map the API shape onto the props InsightCards expects. toCardModel handles
  // the image fallback and coming-soon flag; slug drives the /insights/<slug>
  // link inside the card.
  const cards = posts.slice(0, HOME_INSIGHTS_LIMIT).map((post) => {
    const model = toCardModel(post);
    return {
      id: post.slug,
      slug: post.slug,
      image: model.image,
      tag: model.category,
      readTime: model.readTime,
      title: model.title,
      description: model.description,
      comingSoon: model.comingSoon,
    };
  });

  return <InsightsExplorer posts={cards} />;
}
