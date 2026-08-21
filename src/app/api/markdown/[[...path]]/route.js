import { pageToMarkdown } from "@/lib/htmlToMarkdown.mjs";
import { buildNotFoundMarkdown } from "@/lib/agentGuide.mjs";

// The Markdown half of content negotiation.
//
// Nothing links here. `middleware.js` rewrites to this route when a client
// sends `Accept: text/markdown`, so the URL the client asked for is the URL it
// keeps — this path only exists because a Next.js page and a route handler
// cannot occupy the same segment.
//
// The page is fetched back from this same server rather than re-rendered here.
// That is what makes one route enough for the whole site: a hand-written React
// page, a CMS page assembled from blocks, and an article stored as HTML all
// arrive as rendered HTML, and a page added tomorrow is covered without anyone
// remembering to register it.
//
// Node runtime because the converter parses a DOM (see htmlToMarkdown.mjs).
export const runtime = "nodejs";

// Never prerendered or cached. The pages this mirrors are all `force-dynamic`
// so that a CMS edit is live on the next request; a cached Markdown copy would
// reintroduce exactly the staleness those pages are written to avoid.
export const dynamic = "force-dynamic";

const MARKDOWN_HEADERS = {
  "Content-Type": "text/markdown; charset=utf-8",
  // Repeated here, not only in middleware: this response can also be reached
  // directly, and a cached copy without it is the failure the Vary header
  // exists to prevent.
  Vary: "Accept",
  // Matches the site-wide policy in next.config.mjs. The HTML and Markdown
  // representations of a page must not expire on different schedules.
  "Cache-Control": "public, max-age=0, must-revalidate",
};

const markdown = (body, { status = 200, canonical } = {}) =>
  new Response(body, {
    status,
    headers: {
      ...MARKDOWN_HEADERS,
      // Points a crawler at the real page rather than at this internal path, in
      // case the rewrite is ever bypassed and this URL is fetched directly.
      ...(canonical ? { Link: `<${canonical}>; rel="canonical"` } : {}),
    },
  });

export async function GET(request, { params }) {
  const { path } = await params;
  const requestUrl = new URL(request.url);
  const { origin } = requestUrl;

  // The optional catch-all leaves `path` undefined for the home page.
  const pathname = `/${(path || []).join("/")}`.replace(/\/+$/, "") || "/";
  const canonical = `${origin}${pathname === "/" ? "" : pathname}${requestUrl.search}`;

  let response;
  try {
    response = await fetch(`${origin}${pathname}${requestUrl.search}`, {
      headers: {
        // Ask for the representation this route converts. Combined with the
        // header below, the middleware cannot rewrite this request back here.
        accept: "text/html",
        "x-markdown-render": "1",
        // Forwarded so a draft preview link behaves the same in both
        // representations: the token is already in the query string, and the
        // page decides on its own whether it is valid.
        "user-agent": request.headers.get("user-agent") || "markdown-renderer",
      },
      cache: "no-store",
    });
  } catch {
    // The server could not reach itself. A 502 says that honestly; returning a
    // 200 with an apology in it would let an agent cache "this page is empty".
    return markdown(
      `# 502 — Upstream unavailable\n\nThe page at ${canonical} could not be rendered.\n`,
      { status: 502, canonical },
    );
  }

  if (response.status === 404) {
    return markdown(buildNotFoundMarkdown({ baseUrl: origin, path: pathname }), {
      status: 404,
      canonical,
    });
  }

  if (!response.ok) {
    return markdown(
      `# ${response.status}\n\nThe page at ${canonical} could not be rendered.\n`,
      { status: response.status, canonical },
    );
  }

  const html = await response.text();
  return markdown(pageToMarkdown(html, { sourceUrl: canonical, origin }), {
    canonical,
  });
}

// A HEAD request must advertise the same representation as the GET it precedes,
// without paying to render it. Next.js would otherwise answer HEAD by running
// GET and discarding the body.
export async function HEAD() {
  return new Response(null, { status: 200, headers: MARKDOWN_HEADERS });
}
