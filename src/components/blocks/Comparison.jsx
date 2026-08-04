import { Check, X } from "lucide-react";
import SectionHeader from "./SectionHeader";
import { PAGE_INSET } from "./layout";
import { toneOf } from "./tone";

/**
 * Two columns held against each other, row by row.
 *
 * On a narrow screen the table becomes stacked cards — one card per row, both
 * sides inside it. A horizontally scrolling table would technically fit, but
 * comparing two columns you cannot see at the same time defeats the point of
 * the band.
 */
export default function Comparison({ props }) {
  const { heading, subtitle, leftLabel, rightLabel, rows } = props;
  const { bg, text } = toneOf("lilac");

  if (!rows?.length) return null;

  return (
    <section className={`${bg} py-12 md:py-20 ${PAGE_INSET}`}>
      <div className="mx-auto w-full max-w-[1000px]">
        <SectionHeader heading={heading} subtitle={subtitle} tone="lilac" />

        {/* ── wide: a real two-column table ─────────────────────────────── */}
        <div className="hidden overflow-hidden rounded-[16px] border border-gray-100 bg-white shadow-sm md:block">
          <div className="grid grid-cols-[1.2fr_1fr_1fr] border-b border-gray-100 bg-[#f8f9fc]">
            <span className="px-5 py-4" />
            <span className="flex items-center gap-2 px-5 py-4 text-[14px] font-semibold text-[#8b93b8]">
              <X size={15} aria-hidden="true" /> {leftLabel}
            </span>
            <span className="flex items-center gap-2 px-5 py-4 text-[14px] font-semibold text-[#37469e]">
              <Check size={15} aria-hidden="true" /> {rightLabel}
            </span>
          </div>

          {rows.map((row) => (
            <div
              key={row.id}
              className="grid grid-cols-[1.2fr_1fr_1fr] border-b border-gray-50 last:border-0"
            >
              <span className="px-5 py-4 text-[15px] font-semibold text-[#0e1726]">
                {row.title}
              </span>
              <span className={`px-5 py-4 text-[15px] leading-6 ${text.body}`}>
                {row.left}
              </span>
              <span className="bg-[#4655a50a] px-5 py-4 text-[15px] leading-6 text-[#0e1726]">
                {row.right}
              </span>
            </div>
          ))}
        </div>

        {/* ── narrow: one card per row, both sides visible together ─────── */}
        <div className="space-y-3 md:hidden">
          {rows.map((row) => (
            <div
              key={row.id}
              className="overflow-hidden rounded-[14px] border border-gray-100 bg-white shadow-sm"
            >
              <p className="border-b border-gray-100 bg-[#f8f9fc] px-4 py-3 text-[15px] font-semibold text-[#0e1726]">
                {row.title}
              </p>
              <div className="px-4 py-3">
                <span className="mb-1 flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-[#8b93b8]">
                  <X size={13} aria-hidden="true" /> {leftLabel}
                </span>
                <p className={`text-[15px] leading-6 ${text.body}`}>{row.left}</p>
              </div>
              <div className="bg-[#4655a50a] px-4 py-3">
                <span className="mb-1 flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-[#37469e]">
                  <Check size={13} aria-hidden="true" /> {rightLabel}
                </span>
                <p className="text-[15px] leading-6 text-[#0e1726]">{row.right}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
