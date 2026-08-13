import Image from "next/image";
import { notFound } from "next/navigation";
import {
  getInsightBySlug,
  getAllInsights,
  toCardModel,
} from "@/lib/blogs-api";
import { pickRelatedPosts } from "@/lib/pickRelatedPosts.mjs";
import GenericHero from "@/components/shared/GenericHero";
import TableOfContents from "@/components/insight-page/reader/TableOfContents";
import ExternalLinks from "@/components/insight-page/reader/ExternalLinks";
import ArticleBody from "@/components/insight-page/reader/ArticleBody";
import BlogCta from "@/components/insight-page/reader/BlogCta";
import FaqSection from "@/components/insight-page/reader/FaqSection";
import RelatedArticles from "@/components/insight-page/reader/RelatedArticles";

// Render on every request so an edited or newly published post is reflected
// immediately, rather than being served from a build-time snapshot or ISR
// cache. `getInsightBySlug` is uncached to match.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getInsightBySlug(slug);

  if (!post) return { title: "Insight not found | Tech&" };

  const image = post.heroImage?.url || post.cardImage?.url;
  return {
    title: `${post.title} | Tech&`,
    description: post.subtitle,
    openGraph: {
      title: post.title,
      description: post.subtitle,
      type: "article",
      publishedTime: post.publishedAt,
      images: image ? [{ url: image }] : undefined,
    },
  };
}

// Crop correction stored on the image, replacing what used to be per-slug
// conditionals in this file.
const imageStyle = (img) => ({
  objectPosition: img?.focus || "center",
  transform: img?.zoom && img.zoom !== 1 ? `scale(${img.zoom})` : undefined,
});

export default async function BlogPostPage({ params, searchParams }) {
  const { slug } = await params;
  const { preview } = (await searchParams) || {};

  // Fetch the post and the full list in parallel — the list feeds the
  // "Related articles" strip and both calls are independently cached.
  const [post, allInsights] = await Promise.all([
    getInsightBySlug(slug, preview),
    getAllInsights(),
  ]);
  if (!post) notFound();

  const inlineKeys = new Set(
    (post.ctas || []).filter((c) => c.placement === "inline").map((c) => c.key),
  );
  const endCtas = (post.ctas || []).filter((c) => c.placement === "end");
  const sidebarCtas = (post.ctas || []).filter(
    (c) => c.placement === "sidebar",
  );
  const hasRail =
    (post.externalLinks?.length ?? 0) > 0 || sidebarCtas.length > 0;

  // Same tags preferred, otherwise the latest posts (see pickRelatedPosts).
  const relatedPosts = pickRelatedPosts(allInsights, slug, post.tags, 3).map(
    toCardModel,
  );

  return (
    <main className="min-h-screen bg-white">
      {preview && (
        <div className="bg-amber-500 px-4 py-2 text-center text-sm font-semibold text-white z-1000">
          Draft preview — this post is not published yet.
        </div>
      )}

      {/* Hero — same standard header as the rest of the site. The post's own
          hero image sits behind a heavy scrim so it reads as a faint texture;
          the full image still appears crisply in the article body below. */}
      <GenericHero
        title={post.title}
        subtitle={post.subtitle}
        backgroundImage={post.heroImage?.url || "/contact-page-heroimg.webp"}
        currentLabel={post.title}
        dim={0.9}
      />

      {/* Three-column reader: sticky contents rail, centered article, sticky
          aside. Both rails collapse below lg — the contents becomes an
          accordion above the body, the aside moves beneath it. */}
      <div className="mx-auto grid w-full max-w-[1600px] grid-cols-1 gap-8 px-4 py-12 sm:px-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10 lg:px-12 lg:py-16 xl:grid-cols-[240px_minmax(0,880px)_280px] xl:justify-center">
        <aside className="lg:row-span-2">
          <TableOfContents entries={post.toc || []} />
        </aside>

        <article className="min-w-0">
          <header className="mb-8 flex flex-wrap items-center gap-3">
            <span className="inline-block rounded-md bg-[#37469E] px-3 py-1 text-xs font-semibold text-white">
              {post.category}
            </span>
            {post.readTime && (
              <span className="text-sm text-gray-500">{post.readTime}</span>
            )}
          </header>

          {post.heroImage?.url && (
            <div className="relative mb-12 block h-64 w-full overflow-hidden rounded-lg shadow-lg md:h-96">
              <Image
                src={post.heroImage.url}
                alt={post.heroImage.alt || post.title}
                fill
                className="h-full w-full object-cover"
                style={imageStyle(post.heroImage)}
                priority
              />
            </div>
          )}

          <ArticleBody
            html={post.contentHtml}
            ctas={(post.ctas || []).filter((c) => inlineKeys.has(c.key))}
          />

          {endCtas.map((cta) => (
            <BlogCta key={cta.key} cta={cta} />
          ))}

          <FaqSection faqs={post.faqs} />

          {/* Author + tags */}
          <div className="mt-12 flex flex-wrap items-center justify-between gap-6 border-t border-gray-200 pt-8">
            {post.author?.name && (
              <div className="flex items-center gap-4">
                {post.author.avatarUrl && (
                  <div className="relative h-16 w-16 overflow-hidden rounded-full">
                    <Image
                      src={post.author.avatarUrl}
                      alt={post.author.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <h4 className="text-lg font-bold text-gray-900">
                    {post.author.name}
                  </h4>
                  {post.author.role && (
                    <p className="text-sm text-gray-600">{post.author.role}</p>
                  )}
                </div>
              </div>
            )}

            {post.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg px-4 py-2 text-xs font-semibold text-white shadow-sm"
                    style={{ background: "#4A2D58" }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </article>

        {hasRail && (
          <aside className="min-w-0">
            <div className="space-y-6 xl:sticky xl:top-36">
              <ExternalLinks links={post.externalLinks} />
              {sidebarCtas.map((cta) => (
                <BlogCta key={cta.key} cta={cta} variant="sidebar" />
              ))}
            </div>
          </aside>
        )}
      </div>

      <RelatedArticles posts={relatedPosts} />
    </main>
  );
}
