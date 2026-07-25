"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import PartnerContactCard from "@/components/layout/PartnerContactCard";
import Footer from "@/components/layout/Footer";
import AdminRibbon, { ADMIN_RIBBON_HEIGHT } from "@/components/layout/AdminRibbon";
import { ADMIN_API_BASE, getAccessToken } from "@/lib/adminApi";

// Admin routes get a blank, plain layout — no marketing navbar/footer.
// Every other route keeps the full marketing chrome, plus a thin ribbon at the
// very top when an admin happens to be signed in.
export default function SiteChrome({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const [adminUser, setAdminUser] = useState(null);

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
      <Navbar hasRibbon={hasRibbon} />
      <div style={{ paddingTop: hasRibbon ? ADMIN_RIBBON_HEIGHT : 0 }}>
        {children}
      </div>
      <PartnerContactCard />
      <Footer />
    </>
  );
}
