import { buildArticleSchema } from "@/lib/buildArticleSchema.mjs";

// Emits the post's schema.org BlogPosting document. Rendered from the server
// component tree, like FaqSection, so the JSON-LD is in the initial HTML a
// crawler receives rather than something a client render has to produce.
//
// This is what makes an insight eligible for Google's article treatment
// (headline, byline, publish date, thumbnail) and what tells answer engines who
// wrote the piece and when it was last genuinely revised. The site-wide
// Organization document in app/layout.js stays where it is — this one only ever
// describes a single article.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://techand.ai";

export default function ArticleSchema({ post }) {
  const schema = buildArticleSchema(post, { siteUrl });
  if (!schema) return null;

  // Post titles and subtitles are author-entered free text. Escaping `<` means
  // a stray "</script>" in any of them ends up as data instead of closing this
  // tag early and spilling the rest of the document into the page as markup.
  const json = JSON.stringify(schema).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
