import Accordion from "@/components/shared/Accordion";

// The article's "Frequently asked questions" block. A thin wrapper around the
// generic Accordion: it maps the post's stored FAQs onto accordion items and,
// for search engines, emits a schema.org FAQPage document. The JSON-LD is
// rendered here (a server component) so it lands in the initial HTML crawlers
// see, independent of whether a reader has expanded any answer.
export default function FaqSection({ faqs }) {
  const items = (faqs || []).filter((f) => f?.question && f?.answer);
  if (items.length === 0) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <section aria-labelledby="faq-heading" className="mt-12 border-t border-gray-200 pt-8">
      <h2
        id="faq-heading"
        className="mb-6 text-2xl font-bold text-gray-900"
      >
        Frequently asked questions
      </h2>

      <Accordion
        items={items.map((f, i) => ({
          id: `faq-${i}`,
          title: f.question,
          content: f.answer,
        }))}
        singleOpen
        defaultOpen={0}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </section>
  );
}
