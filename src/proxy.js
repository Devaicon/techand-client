import { NextResponse } from "next/server";
import { negotiate, MARKDOWN } from "@/lib/negotiateAccept.mjs";

// Content negotiation between the site's two representations.
//
// This is a Next.js Proxy — the file convention that was called `middleware`
// before v16, renamed because it runs in front of the app rather than inside
// it. The function must be exported as `proxy` (or as the default); a file
// exporting `middleware` is detected by the build and then never invoked,
// which fails silently and looks exactly like a matcher that does not match.
//
// A browser asking for HTML is passed straight through. An agent sending
// `Accept: text/markdown` is rewritten — internally, so the URL it asked for
// stays the URL it gets — to the route that renders the same page as Markdown.
// Serving two things from one URL makes `Vary: Accept` the header a shared
// cache depends on: without it the first variant to land in cache is served to
// everyone, and an agent gets HTML or a browser gets a .md download depending
// on who arrived first. See varyOnAccept below for where that lands and what
// covers the case where Next.js will not let it.
//
// The ranking rules live in lib/negotiateAccept.mjs so they can be tested
// without a running server.

// Where a Markdown request is rewritten to. Under /api because that prefix is
// already disallowed in robots.txt — the rewrite is invisible to clients, but
// nothing stops someone linking the internal path once they notice it, and a
// second indexable copy of every page is the one outcome worth ruling out.
const MARKDOWN_ROUTE = "/api/markdown";

// Prefixes that have no Markdown representation and must never be rewritten.
// /admin is an authenticated application, not a document.
const SKIP_PREFIXES = ["/_next", "/api", "/admin"];

// Adds Accept to Vary without disturbing what is already there.
//
// This takes effect on the responses the proxy returns itself — the 406 below,
// and the rewrite to the Markdown route, which sets the same header again on
// its own Response. It does NOT take effect on an App Router page render:
// Next.js writes its own Vary for RSC navigation (`rsc, next-router-state-tree,
// …`) and drops a custom one, whether it is set here, appended here, or
// declared in next.config.mjs. Verified against 16.1.1 in all four
// combinations.
//
// What covers the HTML side meanwhile is Cache-Control: every page is served
// `max-age=0, must-revalidate` (next.config.mjs), so a shared cache has to
// revalidate against the origin on every request and this proxy re-runs — a
// cached HTML page cannot be handed to an agent that asked for Markdown. The
// declaration in next.config.mjs still applies to everything Next does not
// manage, such as files under public/.
const varyOnAccept = (headers) => {
  const existing = headers.get("Vary");
  if (!existing) {
    headers.set("Vary", "Accept");
    return;
  }

  const fields = existing.split(",").map((field) => field.trim());
  if (fields.some((field) => field.toLowerCase() === "accept")) return;
  headers.set("Vary", [...fields, "Accept"].join(", "));
};

export function proxy(request) {
  const { pathname, search } = request.nextUrl;

  // Only safe methods have representations to choose between. A POST to the
  // contact form describes its REQUEST body with Accept-adjacent headers and
  // must be left alone.
  if (request.method !== "GET" && request.method !== "HEAD") {
    return NextResponse.next();
  }

  if (SKIP_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // Anything with a file extension is already a concrete representation:
  // /sitemap.xml, /robots.txt, /llms.txt, /og-image.webp. Negotiating those
  // would hand an agent Markdown where it asked for XML.
  if (/\.[a-zA-Z0-9]+$/.test(pathname)) return NextResponse.next();

  // No RSC check here, deliberately. Next.js strips the Flight headers (`rsc`,
  // `next-router-state-tree`, `next-router-prefetch`) from the request before a
  // proxy sees them, precisely so that an RSC request cannot be routed
  // differently from the HTML request it must agree with. Those navigations
  // arrive as `Accept: */*`, which resolves to HTML — the correct answer — so
  // there is nothing left to special-case.

  // The Markdown route fetches the page back from this same server. That
  // request already asks for HTML, so it would resolve correctly on its own —
  // this header makes the loop impossible rather than merely unlikely.
  if (request.headers.get("x-markdown-render")) return NextResponse.next();

  const choice = negotiate(request.headers.get("accept"));

  // Nothing this site can produce is acceptable to the client. RFC 9110 allows
  // serving the default anyway, but a client that said `Accept: application/pdf`
  // is better served by being told than by being handed HTML it will try to
  // parse as a PDF.
  if (choice === null) {
    const response = new NextResponse(
      "406 Not Acceptable\n\n" +
        "This URL can be served as text/html or text/markdown.\n" +
        "Retry with: Accept: text/markdown\n",
      {
        status: 406,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      },
    );
    varyOnAccept(response.headers);
    return response;
  }

  if (choice === MARKDOWN) {
    const url = request.nextUrl.clone();
    // "/" becomes "/api/markdown", "/whatwedo" becomes "/api/markdown/whatwedo".
    // The optional catch-all on the other end accepts both.
    url.pathname = `${MARKDOWN_ROUTE}${pathname === "/" ? "" : pathname}`;
    url.search = search;

    const response = NextResponse.rewrite(url);
    varyOnAccept(response.headers);
    return response;
  }

  const response = NextResponse.next();
  varyOnAccept(response.headers);
  return response;
}

export const config = {
  // Deliberately the plain, documented form. A matcher is compiled by
  // path-to-regexp, not by the JS regex engine, and a character class inside
  // the negative lookahead (`.*\.[a-zA-Z0-9]+$`, to exclude every file
  // extension at once) compiles without error and then silently matches
  // nothing — the proxy is built, reported by `next build`, and never invoked.
  // Extensions are excluded by the runtime guard above instead, which costs one
  // invocation per static file and is worth it for a rule that demonstrably
  // works.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
