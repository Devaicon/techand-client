"use client";

import { useId, useState } from "react";
import SectionHeader from "./SectionHeader";
import SmartLink from "./SmartLink";
import TabStrip from "./TabStrip";
import SplitTabsCard from "./SplitTabsCard";
import { PAGE_INSET } from "./layout";
import { toneOf } from "./tone";

/**
 * Content split across selectable tabs.
 *
 * Three layouts off one field set. `cards` puts a grid of feature cards under
 * each tab — the capabilities band. `panel` puts a short pitch under each.
 * `split` sets that same pitch inside a card beside a photograph — the audience
 * card, which now lives in `SplitTabsCard` so the `header-panel` block can float
 * the identical card up over a header. All three share the tab strip (`TabStrip`)
 * and its keyboard behaviour, which is the reason they are one block.
 *
 * A client component: tab selection is local state. That is fine inside the
 * editor's preview iframe, where `AccordionBlock` already does the same.
 */
export default function Tabs({ props }) {
  const {
    eyebrow,
    heading,
    subtitle,
    layout,
    tabs,
    link,
    image,
    imageEyebrow,
    imageTitle,
    imageBody,
  } = props;
  const { bg, text } = toneOf("cream");

  // Hooks run before any layout branch: an author toggling `layout` in the
  // editor must not change how many hooks this component calls between renders.
  const baseId = useId();
  const [active, setActive] = useState(0);

  const visible = (tabs || []).filter((tab) => !tab.hidden);

  // The split layout is a self-contained card that owns its own tab state and
  // keyboard handling; this block only supplies the band it sits on.
  if (layout === "split") {
    return (
      <section className={`${bg} py-12 md:py-20 ${PAGE_INSET}`}>
        <SplitTabsCard
          eyebrow={eyebrow}
          heading={heading}
          subtitle={subtitle}
          tabs={tabs}
          image={image}
          imageEyebrow={imageEyebrow}
          imageTitle={imageTitle}
          imageBody={imageBody}
          link={link}
        />
      </section>
    );
  }

  if (visible.length === 0) return null;

  const index = Math.min(active, visible.length - 1);
  const current = visible[index];
  const cards = (current.cards || []).filter((card) => !card.hidden);

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
    <section className={`${bg} py-12 md:py-20 ${PAGE_INSET}`}>
      <div className="mx-auto w-full max-w-[1180px]">
        <SectionHeader
          eyebrow={eyebrow}
          heading={heading}
          subtitle={subtitle}
          tone="cream"
        />

        <TabStrip
          visible={visible}
          index={index}
          setActive={setActive}
          onKeyDown={onKeyDown}
          baseId={baseId}
          label={heading}
          split={false}
        />
        <div
          id={`${baseId}-panel-${index}`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${index}`}
        >
          {layout === "panel" ? (
            <PanelBody tab={current} text={text} />
          ) : (
            <CardGrid cards={cards} text={text} />
          )}
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
      </div>
    </section>
  );
}

function CardGrid({ cards, text }) {
  // A tab with no cards is not an error — it is how a half-written tab looks
  // while an author is still filling it in, and in the `panel` and `split`
  // layouts it is the normal state.
  if (cards.length === 0) return null;

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.id}
          className="rounded-[16px] border border-gray-100 bg-white p-6 shadow-sm"
        >
          <h3 className={`text-[17px] font-semibold ${text.heading}`}>
            {card.title}
          </h3>
          {card.description && (
            <p className={`mt-2 text-[15px] leading-7 ${text.body}`}>
              {card.description}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function PanelBody({ tab, text }) {
  return (
    <div className="mx-auto max-w-[860px] rounded-[24px] border border-gray-100 bg-white p-8 shadow-sm md:p-10">
      {tab.heading && (
        <h3 className={`text-2xl font-bold ${text.heading}`}>{tab.heading}</h3>
      )}
      {tab.body && (
        <p className={`mt-3 text-[15px] leading-7 ${text.body}`}>{tab.body}</p>
      )}

      {tab.bullets?.length > 0 && (
        <ul className="mt-6 space-y-3">
          {tab.bullets.map((bullet) => (
            <li key={bullet} className="flex gap-3">
              <span
                aria-hidden="true"
                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-r from-[#4653a2] to-[#683b80]"
              />
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
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#4653a2] to-[#683b80] px-6 py-3 text-[15px] font-semibold text-white"
        />
      )}
    </div>
  );
}
