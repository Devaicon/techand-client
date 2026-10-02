"use client";

import { useId, useState } from "react";
import { Info } from "lucide-react";

// Hover, focus or tap. Tap matters: most owners will read this on a phone,
// where there is no hover.
export default function GlossaryTip({ text }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  if (!text) return null;

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label="What does this mean?"
        aria-describedby={open ? id : undefined}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((o) => !o)}
        className="rounded-full p-0.5 text-gray-400 hover:text-gray-600 focus-visible:outline-2 focus-visible:outline-[#37469E]"
      >
        <Info size={14} />
      </button>
      {open && (
        <span
          role="tooltip"
          id={id}
          className="absolute left-1/2 top-full z-30 mt-1.5 w-64 -translate-x-1/2 rounded-lg bg-gray-900 px-3 py-2 text-xs font-normal leading-5 text-white shadow-lg"
        >
          {text}
        </span>
      )}
    </span>
  );
}
