import { ChevronRight } from "lucide-react";
import { ICON_REGISTRY } from "@/lib/iconRegistry";
import SectionHeader from "./SectionHeader";
import { PAGE_INSET } from "./layout";
import { toneOf } from "./tone";

/**
 * A numbered sequence of phases.
 *
 * The number comes from the stage's position, never from a field an author
 * types: inserting a phase in the middle then renumbers everything below it
 * instead of leaving two "3"s and a gap where 4 should be.
 */
export default function Stages({ props }) {
  const { eyebrow, heading, subtitle, stages, layout, tone } = props;
  const { bg, text } = toneOf(tone || "lilac");

  // The row cards are tinted, so they take the colour the band is not. On a
  // lilac band a lilac card would vanish; on cream it is the tint that makes
  // the card a card without needing a border.
  const cardBg = tone === "lilac" || !tone ? "bg-white" : "bg-[#eceafa]";

  if (!stages?.length) return null;

  const badge = (index) => (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[#4555a7] to-[#53406b] text-[15px] font-bold text-white">
      {index + 1}
    </span>
  );

  const glyphOf = (stage) =>
    stage.icon?.kind === "lucide" && stage.icon?.name
      ? ICON_REGISTRY[stage.icon.name] || null
      : null;

  return (
    <section className={`${bg} py-12 md:py-20 ${PAGE_INSET}`}>
      <div className="mx-auto w-full max-w-[1080px]">
        <SectionHeader
          eyebrow={eyebrow}
          heading={heading}
          subtitle={subtitle}
          tone={tone || "lilac"}
        />

        {layout === "pipeline" ? (
          /* No badges here. A pipeline is ordered but not counted — numbering
             "UAT" as 3 of 5 reads as progress through a process rather than
             the third of five environments that all exist at once. */
          <ol className="flex flex-wrap items-stretch justify-center gap-2">
            {stages.map((stage, index) => (
              <li key={stage.id} className="flex items-center gap-2">
                <div className="rounded-[12px] border border-gray-100 bg-white px-5 py-3.5 text-center shadow-sm">
                  <span className="block text-[15px] font-semibold text-[#0e1726]">
                    {stage.title}
                  </span>
                  {stage.caption && (
                    <span className="mt-0.5 block text-[12px] text-[#8b93b8]">
                      {stage.caption}
                    </span>
                  )}
                </div>
                {index < stages.length - 1 && (
                  <ChevronRight
                    size={18}
                    aria-hidden="true"
                    className="shrink-0 text-[#4555a7]/50"
                  />
                )}
              </li>
            ))}
          </ol>
        ) : layout === "row" ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {stages.map((stage, index) => {
              const Glyph = glyphOf(stage);
              return (
                <div
                  key={stage.id}
                  className={`rounded-[16px] p-6 ${cardBg}`}
                >
                  <div className="mb-6 flex items-start gap-3">
                    {Glyph && (
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br from-[#4653a2] to-[#683b80]">
                        <Glyph className="h-5 w-5 text-white" aria-hidden="true" />
                      </span>
                    )}
                    {/* The number is a watermark here, not a badge: the icon
                        already carries the card, and a second solid marker
                        beside it would make the pair compete. */}
                    <span
                      aria-hidden="true"
                      className="ml-auto text-[40px] font-bold leading-none text-[#4653a2]/15"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="text-[17px] font-bold text-[#37469e]">
                    {stage.title}
                  </h3>
                  {stage.caption && (
                    <p className="mt-0.5 text-[13px] font-semibold text-[#37469e]/70">
                      {stage.caption}
                    </p>
                  )}
                  {stage.body && (
                    <p className={`mt-2 text-[15px] leading-7 ${text.body}`}>
                      {stage.body}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <ol className="relative">
            {stages.map((stage, index) => (
              <li key={stage.id} className="relative flex gap-5 pb-8 last:pb-0">
                {/* The connector runs behind the badges and stops at the last
                    stage, so the line reads as joining phases rather than
                    trailing off the end of the list. */}
                {index < stages.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute left-5 top-10 h-full w-px -translate-x-1/2 bg-gradient-to-b from-[#4555a7]/40 to-transparent"
                  />
                )}

                <div className="relative z-10">{badge(index)}</div>

                <div className="flex-1 rounded-[16px] border border-gray-100 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-baseline gap-x-3">
                    <h3 className="text-[18px] font-semibold text-[#0e1726]">
                      {stage.title}
                    </h3>
                    {stage.caption && (
                      <span className="text-[13px] font-semibold text-[#37469e]">
                        {stage.caption}
                      </span>
                    )}
                  </div>
                  {stage.body && (
                    <p className={`mt-2 text-[15px] leading-7 ${text.body}`}>
                      {stage.body}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
