import Link from "next/link";

// Every link on this page comes from the admin panel, so the destination is
// whatever an author typed: an internal route, a hash anchor, or an outside URL.
// next/link prefetches and client-side-navigates, which is wrong for an external
// host, so the two cases are told apart here once instead of at every call site.
//
// Renders nothing when the label or href is missing. The validator already
// rejects half-filled links, but a section saved before that rule existed would
// otherwise render a button that goes nowhere.
export default function SmartLink({ href, label, className, children }) {
  if (!href || !label) return null;

  const external = /^(https?:)?\/\//i.test(href) || href.startsWith("mailto:");

  if (external) {
    return (
      <a
        href={href}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children ?? label}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children ?? label}
    </Link>
  );
}
