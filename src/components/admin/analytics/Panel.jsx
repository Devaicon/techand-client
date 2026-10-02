"use client";

import GlossaryTip from "./GlossaryTip";

// The card every chart and table sits in. Title + optional "what does this
// mean" + optional action (a link, a toggle) on the right.
export default function Panel({ title, glossary, action, children, className = "" }) {
  return (
    <section className={`min-w-0 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm ${className}`}>
      {(title || action) && (
        <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-1.5 text-base font-semibold text-gray-900">
            {title}
            <GlossaryTip text={glossary} />
          </h2>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}
