"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { Check } from "lucide-react";
import SectionHeader from "./SectionHeader";
import SmartLink from "./SmartLink";
import TabStrip from "./TabStrip";
import { toneOf } from "./tone";

/**
 * The "copy panel beside a photo" card — a tab strip and its panel in one column,
 * a captioned photograph in the other, wrapped in a rounded lilac card.
 *
 * Lifted out of the `tabs` block so the `header-panel` block can float the exact
 * same card up over a header without a second implementation drifting from this
 * one. The card owns its own tab selection and keyboard behaviour; the caller
 * owns the band around it — its background, its horizontal inset, and how far it
 * rises onto whatever sits above. That split is what lets `tabs` render it on a
 * plain cream section while `header-panel` renders it pulled up onto a hero.
 *
 * A client component: tab selection is local state, which is fine inside the
 * editor's preview iframe just as `AccordionBlock` is.
 */
export default function SplitTabsCard({
  eyebrow,
  heading,
  subtitle,
  tabs,
  image,
  imageEyebrow,
  imageTitle,
  imageBody,
  link,
}) {
  const { text } = toneOf("cream");
  const baseId = useId();

  // Hidden tabs are dropped before indexing, so `active` can never point at a
  // tab the visitor cannot select.
  const visible = (tabs || []).filter((tab) => !tab.hidden);
  const [active, setActive] = useState(0);

  if (visible.length === 0) return null;

  const index = Math.min(active, visible.length - 1);
  const current = visible[index];

  // Left/right arrows move between tabs. Without this the strip is a row of
  // buttons that a keyboard user has to tab through one at a time to read the
  // panel behind each.
  const onKeyDown = (event) => {
    const step =
      event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    setActive((i) => (i + step + visible.length) % visible.length);
  };

  return (
    <>
      {/* The photo bleeds to the card's edge, so the rounding lives on the card
          and the columns carry none of their own. */}
      <div className="mx-auto w-full max-w-[1180px] overflow-hidden rounded-[24px] bg-[#eceafa] shadow-[0_18px_50px_-24px_rgba(30,26,66,0.45)]">
        {/* Two columns from `lg`, not `md`. At 768px the 3/5 copy column is
            460px, which is not enough for a 2xl heading, a four-tab strip and a
            bullet list — the stacked version reads better there, and the tablet
            is the width the split was breaking at worst.

            `min-w-0`: a grid item defaults to `min-width: auto`, so its widest
            child sets the track's floor. Without it the tab strip's content would
            widen the column rather than scroll inside it. */}
        <div className="grid items-stretch lg:grid-cols-5">
          <div className="min-w-0 p-8 lg:col-span-3 lg:p-12">
            <SectionHeader
              eyebrow={eyebrow}
              heading={heading}
              subtitle={subtitle}
              tone="lilac"
              align="left"
              className="mb-8"
            />
            <TabStrip
              visible={visible}
              index={index}
              setActive={setActive}
              onKeyDown={onKeyDown}
              baseId={baseId}
              label={heading}
              split
            />
            <div
              id={`${baseId}-panel-${index}`}
              role="tabpanel"
              aria-labelledby={`${baseId}-tab-${index}`}
            >
              <SplitBody tab={current} text={text} />
            </div>
          </div>

          <PhotoPanel
            image={image}
            eyebrow={imageEyebrow}
            title={imageTitle}
            body={imageBody}
          />
        </div>
      </div>

      {link?.href && (
        <div className="mt-10 text-center">
          <SmartLink
            href={link.href}
            label={link.label}
            className="inline-flex items-center gap-2 rounded-full border-2 border-[#4a2d58] px-6 py-3 text-[15px] font-semibold text-[#1e1e1e] transition-colors duration-200 hover:bg-[#4a2d58] hover:text-white"
          />
        </div>
      )}
    </>
  );
}

// The split layout's panel carries no card of its own — the column it sits in is
// already one half of a card, and nesting a second would draw a border around a
// border.
function SplitBody({ tab, text }) {
  return (
    <div>
      {tab.heading && (
        <h3 className={`text-2xl font-bold ${text.heading}`}>{tab.heading}</h3>
      )}
      {tab.body && (
        <p className={`mt-3 text-[15px] leading-7 ${text.body}`}>{tab.body}</p>
      )}

      {tab.bullets?.length > 0 && (
        <ul className="mt-6 space-y-4">
          {tab.bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#4653a2] to-[#683b80]"
              >
                <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
              </span>
              <span className={`text-[15px] leading-7 ${text.body}`}>
                {bullet}
              </span>
            </li>
          ))}
        </ul>
      )}

      {tab.link?.href && (
        <SmartLink
          href={tab.link.href}
          label={tab.link.label}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#4653a2] to-[#683b80] px-7 py-3 text-[15px] font-semibold text-white"
        />
      )}
    </div>
  );
}

// The caption stands on the brand gradient when no photo has been uploaded, so
// the card is whole before the artwork arrives.
function PhotoPanel({ image, eyebrow, title, body }) {
  const hasCaption = eyebrow || title || body;

  return (
    <div className="relative min-h-[280px] overflow-hidden bg-gradient-to-br from-[#4653a2] to-[#683b80] lg:col-span-2">
      {image?.url && (
        <Image
          src={image.url}
          alt={image.alt || ""}
          fill
          sizes="(max-width: 1024px) 100vw, 40vw"
          className="object-cover"
          style={{ objectPosition: image.focus || "center" }}
        />
      )}

      {hasCaption && (
        <>
          {/* Two layers: a scrim that keeps the whole lower half legible, and
              the design's angled indigo wedge over it. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-[#1f1a42]/75 via-[#1f1a42]/15 to-transparent"
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-[55%] bg-[#3b47a0]/70"
            style={{ clipPath: "polygon(0 24%, 100% 0, 100% 100%, 0 100%)" }}
          />
          <div className="absolute inset-x-0 bottom-0 p-8">
            {eyebrow && (
              <span className="mb-2 block text-[12px] font-semibold uppercase tracking-wide text-white/85">
                {eyebrow}
              </span>
            )}
            {title && (
              <p className="text-[26px] font-bold leading-8 text-white">
                {title}
              </p>
            )}
            {body && (
              <p className="mt-2 text-[15px] leading-6 text-white/80">{body}</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
