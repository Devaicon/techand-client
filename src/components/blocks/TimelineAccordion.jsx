"use client";

import { useId, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import SectionHeader from "./SectionHeader";
import { PAGE_INSET } from "./layout";
import { toneOf } from "./tone";

/**
 * A delivery timeline drawn as a numbered accordion.
 *
 * The `stages` block already numbers phases and the shared `Accordion` already
 * discloses panels, but neither draws the two together: a big positional number
 * beside a phase name that opens onto a two-column list of activities. So this
 * owns its own disclosure state rather than wrapping `Accordion` — the number
 * badge sits *outside* the panel, the rows carry no card, and the open content
 * is indented to hang under the phase name, none of which the generic primitive's
 * bordered-card layout gives.
 *
 * The number is the row's position, never a field: inserting a phase renumbers
 * the rest instead of leaving two "03"s.
 *
 * Below the phases sits an optional footer — an environment strip drawn as a
 * left-to-right pill flow, and a governance note — because on the reference page
 * those belong to the same "how delivery runs" band, not a section of their own.
 */
export default function TimelineAccordion({ props }) {
  const {
    eyebrow,
    heading,
    subtitle,
    tone,
    stagesLabel,
    activitiesLabel,
    stages,
    pipelineLabel,
    pipeline,
    governanceLabel,
    governanceBody,
  } = props;
  const { bg, text } = toneOf(tone || "lilac");

  const visible = (stages || []).filter((stage) => !stage.hidden);

  // First phase open: an accordion that starts collapsed reads as a plain list
  // of names until someone clicks one.
  const [open, setOpen] = useState(0);
  const baseId = useId();

  const stops = (pipeline || []).filter(Boolean);
  const hasFooter = stops.length > 0 || Boolean(governanceBody);

  if (visible.length === 0) return null;

  return (
    <section className={`${bg} py-12 md:py-20 ${PAGE_INSET}`}>
      <div className="mx-auto w-full max-w-[1080px]">
        <SectionHeader
          eyebrow={eyebrow}
          heading={heading}
          subtitle={subtitle}
          tone={tone || "lilac"}
          align="left"
        />

        {stagesLabel && <Label className="mb-4">{stagesLabel}</Label>}

        <div className="border-t border-black/[0.08]">
          {visible.map((stage, index) => {
            const isOpen = open === index;
            const number = String(index + 1).padStart(2, "0");
            const panelId = `${baseId}-panel-${index}`;
            const buttonId = `${baseId}-button-${index}`;

            return (
              <div key={stage.id} className="border-b border-black/[0.08]">
                <h3 className="m-0">
                  <button
                    type="button"
                    id={buttonId}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpen((cur) => (cur === index ? -1 : index))}
                    className="flex w-full items-center gap-4 py-5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#37469e]"
                  >
                    <span
                      aria-hidden="true"
                      className={`w-9 shrink-0 text-[22px] font-bold tabular-nums ${
                        isOpen ? "text-[#1f1a42]" : "text-[#1f1a42]/25"
                      }`}
                    >
                      {number}
                    </span>
                    <span className="flex flex-1 flex-wrap items-baseline gap-x-3 gap-y-0.5">
                      <span className="text-[17px] font-semibold text-[#0e1726]">
                        {stage.title}
                      </span>
                      {stage.caption && (
                        <span className="text-[13px] font-medium text-[#8b93b8]">
                          {stage.caption}
                        </span>
                      )}
                    </span>
                    <ChevronDown
                      size={20}
                      aria-hidden="true"
                      className={`shrink-0 text-[#37469e] transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </h3>

                {/* Grid rows 0fr→1fr animate the height with no measurement; the
                    inner overflow-hidden clips the collapse. `inert` drops the
                    closed panel out of tab order and the a11y tree. */}
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  inert={!isOpen}
                  className={`grid transition-all duration-300 ease-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="pb-6 pl-[3.25rem]">
                      {stage.body && (
                        <p className={`text-[15px] leading-7 ${text.body}`}>
                          {stage.body}
                        </p>
                      )}

                      {stage.bullets?.length > 0 && (
                        <>
                          <p className="mb-3 mt-5 text-[13px] font-semibold uppercase tracking-wide text-[#37469e]">
                            {activitiesLabel || "Activities & deliverables"}
                          </p>
                          <ul className="grid gap-x-10 gap-y-2.5 sm:grid-cols-2">
                            {stage.bullets.map((bullet, bulletIndex) => (
                              <li
                                key={bulletIndex}
                                className={`flex items-start gap-2.5 text-[15px] leading-7 ${text.body}`}
                              >
                                <span
                                  aria-hidden="true"
                                  className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#37469e]"
                                />
                                {bullet}
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {hasFooter && (
          <div
            className={`mt-12 grid gap-10 ${
              stops.length > 0 && governanceBody ? "lg:grid-cols-2" : ""
            }`}
          >
            {stops.length > 0 && (
              <div>
                {pipelineLabel && <Label className="mb-4">{pipelineLabel}</Label>}
                {/* Ordered but not numbered: promotion runs one direction, so the
                    arrows carry the sequence and a "3 of 5" badge would read as
                    progress through a process rather than one of five environments
                    that all exist at once. */}
                <ol className="flex flex-wrap items-center gap-x-2 gap-y-3">
                  {stops.map((stop, stopIndex) => (
                    <li key={stopIndex} className="flex items-center gap-2">
                      <span className="rounded-full bg-white px-5 py-2.5 text-[14px] font-semibold text-[#37469e] shadow-sm ring-1 ring-black/5">
                        {stop}
                      </span>
                      {stopIndex < stops.length - 1 && (
                        <ChevronRight
                          size={16}
                          aria-hidden="true"
                          className="shrink-0 text-[#4555a7]/40"
                        />
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {governanceBody && (
              <div>
                {governanceLabel && <Label className="mb-4">{governanceLabel}</Label>}
                <p className={`text-[15px] leading-7 ${text.body}`}>
                  {governanceBody}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

// The small uppercase blue label the band uses over each group — the phases, the
// environment strip, the governance note. One definition so the three never
// drift in size or colour.
function Label({ children, className = "" }) {
  return (
    <p
      className={`text-[13px] font-semibold uppercase tracking-wide text-[#37469e] ${className}`}
    >
      {children}
    </p>
  );
}
