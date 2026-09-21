import { useState } from "react";
import SectionHeader from "./SectionHeader";
import { AccordionBody } from "./AccordionBlock";
import ImageFrame from "./ImageFrame";
import { PAGE_INSET } from "./layout";
import { toneOf } from "./tone";

export default function ExplainerAccordion({ props }) {
  const { heading, subtitle, image, tabs, columns, accordionItems } = props;
  const { bg } = toneOf("cream");
  const hasTabs = (tabs || []).filter((t) => !t.hidden).length > 0;
  const [activeTab, setActiveTab] = useState(0);
  const visibleTabs = (tabs || []).filter((t) => !t.hidden);

  const currentColumns = hasTabs ? visibleTabs[activeTab]?.columns || columns : columns;
  const currentAccordion = hasTabs ? visibleTabs[activeTab]?.accordionItems || accordionItems : accordionItems;

  return (
    <section className={`${bg} py-12 md:py-20 ${PAGE_INSET}`}>
      <div className="mx-auto w-full max-w-[1180px]">
        <SectionHeader heading={heading} subtitle={subtitle} tone="cream" />
        {hasTabs && (
          <div className="mb-6 flex flex-wrap gap-2">
            {visibleTabs.map((tab, i) => (
              <button key={i} onClick={() => setActiveTab(i)} className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${i === activeTab ? "bg-gradient-to-r from-[#4653a2] to-[#683b80] text-white" : "bg-white text-[#4a5565] border border-gray-100 hover:bg-gray-50"}`}>
                {tab.title}
              </button>
            ))}
          </div>
        )}
        <div className="grid items-start gap-8 lg:grid-cols-[1fr_0.9fr]">
          <div>
            {(currentColumns || []).map((col, i) => (
              <div key={i} className="mb-6">
                {col.heading && <h3 className="text-xl font-bold text-[#0f172a]">{col.heading}</h3>}
                {col.body && <p className="mt-2 text-[15px] leading-7 text-[#4a5565]">{col.body}</p>}
              </div>
            ))}
            <AccordionBody items={currentAccordion || []} />
          </div>
          {image?.url && (
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[20px] shadow-lg">
              <ImageFrame image={image} alt={heading} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
