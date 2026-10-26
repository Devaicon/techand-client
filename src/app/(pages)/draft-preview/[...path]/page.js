import { notFound } from "next/navigation";
import { getPage } from "@/lib/pages-api";
import { getInsightBySlug, getAllInsights } from "@/lib/blogs-api";
import CmsPageView, { cmsPageMetadata } from "@/components/blocks/CmsPageView";
import InsightPostView, {
  insightMetadata,
} from "@/components/insight-page/reader/InsightPostView";

// Draft previews, uncached.
//
// Nothing links here. Preview links keep their public form —
// /some-page?preview=<token> or /insights/<slug>?preview=<token> — and the
// proxy rewrites any request carrying `preview` to this route internally, so
// the address bar never changes. That split is what lets the public CMS and
// article routes be cached: reading `searchParams` there would make every
// request to them dynamic, and every response `private, no-store`.
//
// Without a token this route 404s, so it can never serve a second, indexable
// copy of a published page. With one, the API decides whether the token is
// valid; the page is marked noindex either way.
export const dynamic = "force-dynamic";

// "insights/<slug>" is an article; every other path is a CMS page. Those are
// the only two kinds of content with drafts.
const resolve = async (params, searchParams) => {
  const { path = [] } = await params;
  const { preview, edit } = (await searchParams) || {};
  if (!preview) return null;

  if (path.length === 2 && path[0] === "insights") {
    const slug = path[1];
    const [post, allInsights] = await Promise.all([
      getInsightBySlug(slug, preview),
      getAllInsights(),
    ]);
    return { kind: "insight", slug, post, allInsights };
  }

  return { kind: "page", data: await getPage(path.join("/"), preview), edit };
};

export async function generateMetadata({ params, searchParams }) {
  const target = await resolve(params, searchParams);
  if (!target) return {};

  const metadata =
    target.kind === "insight"
      ? insightMetadata(target.post, target.slug, { preview: true })
      : cmsPageMetadata(target.data);

  return { ...metadata, robots: { index: false, follow: false } };
}

export default async function DraftPreviewPage({ params, searchParams }) {
  const target = await resolve(params, searchParams);
  if (!target) notFound();

  if (target.kind === "insight") {
    if (!target.post) notFound();
    return (
      <InsightPostView
        post={target.post}
        allInsights={target.allInsights}
        slug={target.slug}
        preview
      />
    );
  }

  if (!target.data) notFound();
  return <CmsPageView data={target.data} edit={target.edit} />;
}
