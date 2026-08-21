import Link from "next/link";
import { SECTIONS, MACHINE_READABLE } from "@/lib/agentGuide.mjs";

export const metadata = {
  title: "404 - Page Not Found",
  description: "The page you're looking for doesn't exist or has been moved.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="text-center max-w-2xl">
        <h1
          className="text-9xl font-bold text-gray-200 mb-4"
          aria-label="Error 404"
        >
          404
        </h1>
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-[#5B6FB6] text-white px-8 py-4 rounded-lg hover:bg-[#4a5e9d] transition-colors font-semibold"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span>Go Back Home</span>
        </Link>

        {/* Recovery links.
            A visitor who mistyped a URL and an agent that guessed one both need
            the same thing: somewhere to go next. The section list is the one in
            agentGuide.mjs, so this page, /llms.txt and the Markdown 404 body
            never disagree about what the site contains.

            Rendered as real links rather than a paragraph of text because
            `robots: { follow: true }` above is only useful if there is
            something here to follow. */}
        <nav
          aria-label="Main sections"
          className="mt-12 border-t border-gray-100 pt-8"
        >
          <p className="text-sm font-semibold text-gray-500 mb-3">
            Try one of these
          </p>
          <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2">
            {SECTIONS.map(({ path, title }) => (
              <li key={path}>
                <Link
                  href={path}
                  className="text-sm text-[#5B6FB6] hover:text-[#4a5e9d] hover:underline"
                >
                  {title}
                </Link>
              </li>
            ))}
          </ul>

          <p className="mt-6 text-xs text-gray-400">
            Machine-readable:{" "}
            {MACHINE_READABLE.map(({ path, title }, index) => (
              <span key={path}>
                {index > 0 && <span aria-hidden="true"> · </span>}
                {/* Plain anchors: these are generated route handlers, not
                    App Router pages, so there is nothing for next/link to
                    prefetch. */}
                <a href={path} className="hover:text-gray-600 hover:underline">
                  {title}
                </a>
              </span>
            ))}
          </p>
        </nav>
      </div>
    </div>
  );
}
