import Accordion from "@/components/shared/Accordion";
import ImageFrame from "./ImageFrame";
import SectionHeader from "./SectionHeader";
import { PAGE_INSET } from "./layout";
import { toneOf } from "./tone";

/**
 * A question-and-answer band.
 *
 * Named `AccordionBlock`, not `Accordion` — the shared disclosure primitive it
 * wraps already owns that name, and two files called Accordion in the same
 * import graph is a mistake waiting to be made.
 *
 * Three shapes, from one set of fields:
 *
 *   no image      — the centred 880px column it has always been.
 *   image         — questions on one side, a photograph on the other.
 *   shareImage    — no image of its own; BlockRenderer hands it to
 *                   SharedImageBand instead, which draws it under the image
 *                   belonging to the feature-split above. This component is
 *                   never called in that case.
 */

// The items list and the disclosure itself, without the band around them. The
// merged band renders exactly this inside the copy column it shares with an
// explainer, so the two cannot drift.
export function AccordionBody({ items }) {
  const accordionItems = (items || [])
    // `withoutHiddenRows` drops these on the public read; the editor's preview
    // renders the unfiltered bundle, so the flag is honoured here too.
    .filter((item) => !item.hidden)
    .map((item) => ({
      id: item.id,
      title: item.title,
      content: (
        <p className="text-[15px] leading-7 text-[#4a5565]">{item.body}</p>
      ),
    }));

  if (accordionItems.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-[16px] border border-gray-100 bg-white shadow-sm">
      {/* First panel open: an accordion that starts fully collapsed reads as an
          unstyled list of links until someone clicks one. */}
      <Accordion items={accordionItems} defaultOpen={0} />
    </div>
  );
}

export default function AccordionBlock({ props }) {
  const { heading, subtitle, items, image, align, tone } = props;
  const { bg } = toneOf(tone);

  const visible = (items || []).filter((item) => !item.hidden);
  if (visible.length === 0) return null;

  // An `image` control is always present in the props; only a `url` means an
  // author actually chose a picture. Without this check every accordion on the
  // site would silently switch to two columns and grow a placeholder photo.
  const hasImage = Boolean(image?.url);

  if (!hasImage) {
    return (
      <section className={`${bg} py-12 md:py-20 ${PAGE_INSET}`}>
        <div className="mx-auto w-full max-w-[880px]">
          <SectionHeader heading={heading} subtitle={subtitle} tone={tone} />
          <AccordionBody items={items} />
        </div>
      </section>
    );
  }

  const copyFirst = align !== "right";

  return (
    <section className={`${bg} py-12 md:py-20 ${PAGE_INSET}`}>
      <div className="grid w-full items-start gap-8 lg:grid-cols-2 lg:gap-14">
        <div className={copyFirst ? "lg:order-1" : "lg:order-2"}>
          {/* Left-aligned and tighter than the centred variant: beside a
              photograph, a centred heading over a left-aligned list of
              questions has nothing to line up with. */}
          <SectionHeader
            heading={heading}
            subtitle={subtitle}
            tone={tone}
            align="left"
            className="mb-6"
          />
          <AccordionBody items={items} />
        </div>

        <div className={copyFirst ? "lg:order-2" : "lg:order-1"}>
          <div className="lg:sticky lg:top-24">
            <ImageFrame image={image} alt={heading} />
          </div>
        </div>
      </div>
    </section>
  );
}
