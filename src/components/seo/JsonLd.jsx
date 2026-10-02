import { serializeJsonLd } from "@/lib/structuredData.mjs";

// One schema.org document as a JSON-LD script tag.
//
// A server component, so the markup is in the initial HTML a crawler receives
// rather than something a client render has to produce. Renders nothing for a
// null schema, which is what every builder returns when there is nothing true to
// say — a page with no FAQs gets no FAQPage, not an empty one.
export default function JsonLd({ schema }) {
  if (!schema) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }}
    />
  );
}
