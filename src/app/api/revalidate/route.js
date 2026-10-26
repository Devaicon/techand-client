import { revalidatePath } from "next/cache";
import { ADMIN_API_BASE } from "@/lib/adminSession";

// Purges every cached page and API response on the public site.
//
// The public pages are cached (ISR) so the CDN can serve their HTML. What keeps
// an admin edit visible on the next request — the guarantee the site had when
// every page rendered uncached — is this route: adminApi calls it after every
// successful write (see lib/adminApi.js), and it drops the whole cache.
//
// Everything, rather than the one page that changed, because almost no write
// touches only one page: the navbar is on every page, a post appears on its own
// URL, on /insights, on the home page, in "Related articles" and in any CMS page
// with an Insights feed block. The site is small enough that re-rendering it
// on demand costs less than getting that dependency list wrong.
//
// Authorised by the admin's own bearer token, checked against the API's
// /auth/me — the same check every admin request goes through. No shared secret
// to provision, and nobody without an admin session can force the site to
// re-render.
export const runtime = "nodejs";

export async function POST(request) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return Response.json({ revalidated: false }, { status: 401 });
  }

  let me;
  try {
    me = await fetch(`${ADMIN_API_BASE}/auth/me`, {
      headers: { authorization },
      cache: "no-store",
    });
  } catch {
    return Response.json({ revalidated: false }, { status: 502 });
  }
  if (!me.ok) {
    return Response.json({ revalidated: false }, { status: 401 });
  }

  revalidatePath("/", "layout");
  return Response.json({ revalidated: true });
}
