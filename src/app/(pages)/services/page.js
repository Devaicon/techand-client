import { notFound } from "next/navigation";
import { getServicesPage } from "@/lib/services-api";
import GenericHero from "@/components/shared/GenericHero";
import SectionRenderer from "@/components/services/SectionRenderer";

// Render on every request so publishing the page, editing a section or
// reordering the list is reflected immediately rather than served from a
// build-time snapshot. `getServicesPage` is uncached to match.
export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }) {
  const { preview } = (await searchParams) || {};
  const data = await getServicesPage(preview);

  if (!data) return { title: "Services | Tech&" };

  const { page } = data;
  return {
    title: page.metaTitle || `${page.title} | Tech&`,
    description: page.metaDescription || page.subtitle || undefined,
    // A draft is only reachable by token, but a reviewer might still paste the
    // preview URL somewhere a crawler can see it.
    robots: data.isPreview ? { index: false, follow: false } : undefined,
  };
}

export default async function ServicesPage({ searchParams }) {
  const { preview } = (await searchParams) || {};
  const data = await getServicesPage(preview);

  // Draft, missing, or API down — all indistinguishable to a visitor, by
  // design. A draft page must not be detectable by the shape of its error.
  if (!data) notFound();

  const { page, sections, isPreview } = data;

  return (
    <main>
      {isPreview && (
        <p className="bg-amber-500 px-4 py-2 text-center text-sm font-semibold text-white">
          Draft preview — this page is not published and is only visible with
          this link.
        </p>
      )}

      {/* Static shell: the hero is code, not content. Its copy comes from page
          settings, but its layout and artwork do not. */}
      <GenericHero
        title={page.title}
        subtitle={page.subtitle}
        backgroundImage="/contact-page-heroimg.webp"
      />

      {/* Everything below the hero is assembled in the admin panel. */}
      <SectionRenderer sections={sections} />
    </main>
  );
}
