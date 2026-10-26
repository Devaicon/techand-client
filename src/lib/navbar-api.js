// The CMS navigation tree.
//
// Called from the root layout (a Server Component) so the menu is in the
// server-rendered HTML, and from SiteChrome in the browser as the fallback for
// when that server call came back empty. Plain fetch, so it runs unchanged in
// both places.
//
// Returns `null` for "not configured, use the built-in menu" AND for any
// failure. Both mean the same thing to the caller: fall back. A site that
// renders with no navigation because the API blipped is a worse outcome than one
// showing a slightly stale menu.

import { normalizeNavbarHrefs } from "@/lib/siteHref.mjs";
import { REVALIDATE_CONTENT } from "@/lib/cache";

const API =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1/public";

export async function getNavbar() {
  try {
    // Cached on the server — this runs in the root layout, so `no-store` here
    // would make every page on the site uncacheable. An admin save to the
    // navbar purges it (app/api/revalidate). In the browser `next` is ignored.
    const res = await fetch(`${API}/navbar`, {
      next: { revalidate: REVALIDATE_CONTENT },
    });
    if (!res.ok) return null;

    const json = await res.json();
    const navbar = json?.data?.navbar;

    // An empty menu is not a menu. Treating "configured but with no items" as a
    // fallback keeps a half-finished edit from blanking the site's navigation.
    if (!navbar || !Array.isArray(navbar.items) || navbar.items.length === 0) {
      return null;
    }

    // Link fields are free text. A row typed without its leading slash would
    // otherwise resolve relative to whatever page the menu is drawn on — see
    // siteHref for the 404s that caused across the site.
    return normalizeNavbarHrefs(navbar);
  } catch {
    return null;
  }
}
