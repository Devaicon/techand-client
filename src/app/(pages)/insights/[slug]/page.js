import { notFound } from "next/navigation";
import { getInsightBySlug, getAllInsights } from "@/lib/blogs-api";
import InsightPostView, {
  insightMetadata,
} from "@/components/insight-page/reader/InsightPostView";

// Cached (ISR) so the CDN can serve the HTML. Each article renders on its first
// request and is then reused until an admin save purges it (see
// app/api/revalidate) or REVALIDATE_CONTENT elapses, whichever comes first.
//
// That is also why this route never reads `searchParams`: doing so makes every
// request dynamic and the response `private, no-store`. Draft links carry
// `?preview=`, and the proxy rewrites those to app/(pages)/draft-preview, which
// renders the same InsightPostView uncached.
//
// A literal because Next reads segment config statically; keep it equal to
// REVALIDATE_CONTENT in lib/cache.js.
export const revalidate = 300;

// Nothing is rendered at build time — the build must not depend on the API —
// but returning a list at all is what makes unknown slugs cacheable on demand.
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return insightMetadata(await getInsightBySlug(slug), slug);
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;

  // Fetch the post and the full list in parallel — the list feeds the
  // "Related articles" strip and both calls are independently cached.
  const [post, allInsights] = await Promise.all([
    getInsightBySlug(slug),
    getAllInsights(),
  ]);
  if (!post) notFound();

  return <InsightPostView post={post} allInsights={allInsights} slug={slug} />;
}
