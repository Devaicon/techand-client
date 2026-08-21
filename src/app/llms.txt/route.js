import { SITE_CONFIG } from "@/lib/constants";
import { buildLlmsTxt } from "@/lib/agentGuide.mjs";
import { getSitemapPages } from "@/lib/pages-api";
import { getAllInsights } from "@/lib/blogs-api";

// /llms.txt — the llmstxt.org guide for agents.
//
// Generated rather than committed as a static file so its link sections list
// what is actually published: a CMS page added this morning appears here
// without a deploy, which is the same reason sitemap.xml is generated.
//
// The when-to-use guidance it opens with — the part an agent reads to decide
// whether this site is the right source at all — lives in lib/agentGuide.mjs
// alongside the Markdown 404 body, so the two can never describe the site
// differently.

// Same hourly cadence as sitemap.xml, and for the same reason: this is a
// crawler-facing document assembled from two API calls, and re-reading it must
// not be a way to put load on the database.
export const revalidate = 3600;

export async function GET() {
  const baseUrl = SITE_CONFIG.url.replace(/\/+$/, "");

  // `getAllInsights` rather than the sitemap feed: this file lists articles by
  // title and subtitle, and those only come back on the full card shape. Both
  // calls degrade to [] on failure, which shortens the file rather than
  // failing it — an llms.txt that 500s is worse than one missing a section.
  const [cmsPages, posts] = await Promise.all([
    getSitemapPages({ revalidate }),
    getAllInsights({ revalidate }),
  ]);

  return new Response(buildLlmsTxt({ baseUrl, cmsPages, posts }), {
    headers: {
      // text/plain, not text/markdown: llms.txt is fetched by name, never
      // negotiated, and every published example serves it as plain text.
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
