import { splitCtaSlots } from "@/lib/splitCtaSlots.mjs";
import BlogCta from "./BlogCta";

// Renders the article, interleaving inline CTAs as real components.
//
// dangerouslySetInnerHTML is safe here ONLY because contentHtml was sanitized
// server-side on save (server/src/utils/sanitizeHtml.js) — script tags, event
// handlers and javascript: URLs are already gone. Nothing on this path may
// render HTML that has not been through that pipeline.
export default function ArticleBody({ html, ctas = [] }) {
  const segments = splitCtaSlots(html);
  const byKey = new Map(ctas.map((c) => [c.key, c]));

  return (
    <div className="blog-prose">
      {segments.map((segment, idx) =>
        segment.type === "cta" ? (
          <BlogCta key={`cta-${segment.key}-${idx}`} cta={byKey.get(segment.key)} />
        ) : (
          <div
            key={`html-${idx}`}
            dangerouslySetInnerHTML={{ __html: segment.html }}
          />
        ),
      )}
    </div>
  );
}
