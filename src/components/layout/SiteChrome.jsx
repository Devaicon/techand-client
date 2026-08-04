"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import CmsNavbar from "@/components/layout/CmsNavbar";
import PartnerContactCard from "@/components/layout/PartnerContactCard";
import Footer from "@/components/layout/Footer";
import AdminRibbon, { ADMIN_RIBBON_HEIGHT } from "@/components/layout/AdminRibbon";
import { ADMIN_API_BASE, getAccessToken } from "@/lib/adminApi";
import { getNavbar } from "@/lib/navbar-api";

// Admin routes get a blank, plain layout — no marketing navbar/footer.
// Every other route keeps the full marketing chrome, plus a thin ribbon at the
// very top when an admin happens to be signed in.
export default function SiteChrome({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const [adminUser, setAdminUser] = useState(null);
  // null means "not configured, or the fetch failed" — either way the built-in
  // Navbar renders. See the fallback note where it is chosen below.
  const [menu, setMenu] = useState(null);

  useEffect(() => {
    if (isAdmin) return undefined;
    let active = true;
    (async () => {
      const navbar = await getNavbar();
      if (active) setMenu(navbar);
    })();
    return () => {
      active = false;
    };
  }, [isAdmin]);

  // Probe the admin session once on public routes. Plain fetch (not adminApi)
  // so we never trigger the refresh interceptor for anonymous visitors. Skip
  // entirely when there's no stored token — an anonymous visitor never hits the
  // API.
  useEffect(() => {
    if (isAdmin) return undefined;
    const token = getAccessToken();
    if (!token) return undefined;
    let active = true;
    (async () => {
      try {
        const res = await fetch(`${ADMIN_API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const json = await res.json();
        if (active) setAdminUser(json?.data?.user || null);
      } catch {
        /* not signed in or offline — no ribbon */
      }
    })();
    return () => {
      active = false;
    };
  }, [isAdmin]);

  if (isAdmin) return children;

  const hasRibbon = !!adminUser;

  return (
    <>
      {hasRibbon && <AdminRibbon user={adminUser} />}
      {/* The CMS navigation when one has been authored, the built-in menu when
          it has not. Keeping the original as the fallback is what makes the
          migration reversible: an empty or broken CMS menu shows the menu the
          site has always had rather than no navigation at all. Once the seeded
          menu is verified, `Navbar.jsx` becomes dead code. */}
      {menu ? (
        <CmsNavbar menu={menu} hasRibbon={hasRibbon} />
      ) : (
        <Navbar hasRibbon={hasRibbon} />
      )}
      <div style={{ paddingTop: hasRibbon ? ADMIN_RIBBON_HEIGHT : 0 }}>
        {children}
      </div>
      <PartnerContactCard />
      <Footer />
    </>
  );
}
