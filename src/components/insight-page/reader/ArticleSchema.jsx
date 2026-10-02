import JsonLd from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/constants";
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
export default function ArticleSchema({ post }) {
  // JsonLd escapes `<`, so a "</script>" in an author-entered title stays data.
  return <JsonLd schema={buildArticleSchema(post, { siteUrl: SITE_URL })} />;
}
