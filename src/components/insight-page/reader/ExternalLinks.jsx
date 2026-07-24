import { ArrowUpRight, Link2 } from "lucide-react";

// Curated further-reading rail. Every link leaves the site, so all of them get
// noopener/noreferrer and an explicit visual "leaves this page" affordance
// rather than looking like in-site navigation.
export default function ExternalLinks({ links }) {
  if (!links || links.length === 0) return null;

  return (
    <section aria-labelledby="further-reading">
      <p
        id="further-reading"
        className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400"
      >
        <Link2 size={14} /> Further reading
      </p>

      <ul className="space-y-2">
        {links.map((link, idx) => (
          <li key={`${link.url}-${idx}`}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-xl border border-gray-200 p-3 transition-colors hover:border-[#37469E] hover:bg-[#F7F8FD]"
            >
              <span className="flex items-start justify-between gap-2">
                <span className="text-sm font-semibold leading-snug text-gray-900 group-hover:text-[#37469E]">
                  {link.label}
                </span>
                <ArrowUpRight
                  size={15}
                  className="mt-0.5 shrink-0 text-gray-400 group-hover:text-[#37469E]"
                />
              </span>
              {link.description && (
                <span className="mt-1 block text-xs leading-relaxed text-gray-500">
                  {link.description}
                </span>
              )}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
