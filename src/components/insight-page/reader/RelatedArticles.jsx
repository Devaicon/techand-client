import Image from "next/image";
import {
  CategoryBadge,
  ReadTime,
  CardWrapper,
  ReadMoreButton,
} from "@/components/insight-page/InsightComponents";

// One related-post card. Mirrors the grid card on the insights listing so a
// post looks the same wherever it turns up.
function RelatedCard({ post }) {
  return (
    <CardWrapper className="flex flex-col">
      {/* Same 16:9 window as the listing grid — see InsightCard.jsx. */}
      <div className="relative aspect-video w-full shrink-0">
        <Image
          src={post.image}
          alt={post.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
          style={{ objectPosition: post.imageFocus || "center" }}
        />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-center gap-3">
          <CategoryBadge category={post.category} variant="secondary" />
          <ReadTime label={post.readTime} className="text-xs" />
        </div>
        <h3 className="mb-2 line-clamp-2 text-base font-bold text-gray-900 sm:text-lg">
          {post.title}
        </h3>
        <p className="mb-4 line-clamp-3 flex-1 text-sm text-gray-600">
          {post.description}
        </p>
        <ReadMoreButton href={post.link} />
      </div>
    </CardWrapper>
  );
}

/**
 * "Related articles" strip shown at the foot of a blog post.
 *
 * @param {Object} props
 * @param {Array<Object>} props.posts - Card models (see `toCardModel`), already
 *   ranked. Renders nothing when empty, so the post page never shows an orphaned
 *   heading with no cards under it.
 */
export default function RelatedArticles({ posts = [] }) {
  if (!posts || posts.length === 0) return null;

  return (
    <section className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-14 sm:px-8 lg:px-12 lg:py-16">
        <h2 className="mb-8 text-2xl font-bold text-gray-900 sm:text-3xl">
          Related articles
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <RelatedCard key={post.link} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
