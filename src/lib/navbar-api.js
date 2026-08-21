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

const API =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1/public";

export async function getNavbar() {
  try {
    const res = await fetch(`${API}/navbar`, { cache: "no-store" });
    if (!res.ok) return null;

    const json = await res.json();
    const navbar = json?.data?.navbar;

    // An empty menu is not a menu. Treating "configured but with no items" as a
    // fallback keeps a half-finished edit from blanking the site's navigation.
    if (!navbar || !Array.isArray(navbar.items) || navbar.items.length === 0) {
      return null;
    }

    return navbar;
  } catch {
    return null;
  }
}
