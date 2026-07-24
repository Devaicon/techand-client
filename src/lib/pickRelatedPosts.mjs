// Chooses which other posts to show at the bottom of a blog post.
//
// Ranking: posts sharing the most tags with the current post come first; ties
// (including posts that share no tags at all) break toward the most recently
// published. That single ordering gives us "related by tag, and if there aren't
// enough of those, fall back to the latest" without a separate code path.

const publishedTime = (post) =>
  new Date(post?.publishedAt || post?.createdAt || 0).getTime() || 0;

/**
 * @param {Array<Object>} allPosts - Every published post (raw API shape).
 * @param {string} currentSlug - Slug of the post being viewed (excluded).
 * @param {Array<string>} [currentTags] - Tags of the current post.
 * @param {number} [limit] - Max posts to return.
 * @returns {Array<Object>} Up to `limit` posts, most relevant first.
 */
export function pickRelatedPosts(allPosts, currentSlug, currentTags = [], limit = 3) {
  const wanted = new Set((currentTags || []).map((t) => String(t).toLowerCase()));

  return (allPosts || [])
    .filter((post) => post && post.slug && post.slug !== currentSlug)
    .map((post) => ({
      post,
      shared: (post.tags || []).filter((t) => wanted.has(String(t).toLowerCase()))
        .length,
      time: publishedTime(post),
    }))
    .sort((a, b) => b.shared - a.shared || b.time - a.time)
    .slice(0, Math.max(0, limit))
    .map((entry) => entry.post);
}
