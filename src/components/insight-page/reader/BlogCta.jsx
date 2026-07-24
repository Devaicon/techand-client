import Link from "next/link";
import { ArrowRight } from "lucide-react";

// Internal hrefs use next/link for client-side navigation; external ones need a
// plain anchor plus noopener. Deciding here keeps every caller from repeating
// the check.
function CtaLink({ href, className, children }) {
  const external = /^https?:\/\//i.test(href);

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

// `sidebar` renders in the narrow right rail, so it drops to a compact stacked
// layout; `inline` and `end` get the full-width panel. Same data either way —
// only the density changes.
export default function BlogCta({ cta, variant = "block" }) {
  if (!cta) return null;

  const label = cta.buttonLabel || "Get in touch";

  if (variant === "sidebar") {
    return (
      <div className="rounded-xl bg-gradient-to-br from-[#4555A7] to-[#53406B] p-4 text-white">
        <p className="mb-1.5 text-sm font-bold leading-snug">{cta.title}</p>
        {cta.description && (
          <p className="mb-3 text-xs leading-relaxed text-white/80">
            {cta.description}
          </p>
        )}
        <CtaLink
          href={cta.href}
          className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-[#37469E] transition-colors hover:bg-gray-100"
        >
          {label} <ArrowRight size={14} />
        </CtaLink>
      </div>
    );
  }

  return (
    <div className="my-10 rounded-xl border-2 border-[#4555A7]/20 bg-gradient-to-br from-purple-50 to-blue-50 p-6 sm:p-8">
      <h4 className="mb-3 text-xl font-bold text-gray-900 sm:text-2xl">
        {cta.title}
      </h4>
      {cta.description && (
        <p className="mb-5 text-base leading-relaxed text-gray-700">
          {cta.description}
        </p>
      )}
      <CtaLink
        href={cta.href}
        className="inline-flex items-center gap-2 rounded-lg bg-[#37469E] px-6 py-3 font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
      >
        {label} <ArrowRight size={16} />
      </CtaLink>
    </div>
  );
}
