import Image from "next/image";
import { ArrowRight } from "lucide-react";
import ServiceCardTile from "./ServiceCardTile";
import SmartLink from "./SmartLink";
import { PAGE_INSET } from "./layout";

/**
 * A platform band: heading, blurb and brand lockup on one side, a stack of
 * sub-cards on the other. `align` decides which side the copy sits on, so
 * consecutive blocks can mirror each other the way the reference does.
 *
 * Reads `props` rather than the whole section: a block renderer has no business
 * knowing a block's id, order or visibility — those are the page's concern, and
 * the renderer has already acted on them by the time this is called.
 */
export default function PlatformBlock({ props: section }) {
  const copyFirst = section.align !== "right";

  const copy = (
    // `flex flex-col`, not `justify-center`: the brand lockup below uses
    // `mt-auto` to sit on the block's baseline, and centring the column would
    // leave it floating in the middle instead.
    <div className="flex flex-col">
      <h2 className="text-[26px] font-bold text-[#0e1726] sm:text-[30px]">
        {section.heading}
      </h2>

      {section.body && (
        <p className="mt-3 text-[16px] leading-7 text-[#4a5565]">
          {section.body}
        </p>
      )}

      <SmartLink
        href={section.link?.href}
        label={section.link?.label}
        className="mt-4 inline-flex items-center gap-1.5 self-start text-[15px] font-semibold text-[#37469e] hover:underline"
      >
        {section.link?.label}
        <ArrowRight size={16} aria-hidden="true" />
      </SmartLink>

      {section.media?.url && (
        // `mt-auto` pins the lockup to the bottom of the block. The grid
        // stretches both columns to the same height, so this keeps the lockup on
        // the baseline of the card stack opposite regardless of how long the
        // heading and body copy run.
        <div className="mt-auto pt-8">
          {/* Intrinsic width/height with `w-full h-auto` rather than `fill`:
              `fill` needs a fixed container height, which would crop or letterbox
              a lockup whose aspect ratio the author does not control. */}
          <Image
            src={section.media.url}
            alt={section.media.alt || section.heading}
            width={640}
            height={200}
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="h-auto w-full object-contain"
          />
        </div>
      )}
    </div>
  );

  const cards = (
    <div className="flex flex-col gap-4">
      {(section.cards || []).map((card) => (
        <ServiceCardTile key={card.id} card={card} variant="compact" />
      ))}
    </div>
  );

  return (
    <section className={`bg-[#fef9f3] py-10 ${PAGE_INSET}`}>
      <div className="grid w-full gap-8 rounded-[24px] bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)] sm:p-10 lg:grid-cols-2 lg:gap-12">
        {/* Source order is copy-then-cards regardless of side, so a screen
            reader always hears what the block is about before its contents.
            `lg:order-*` does the visual mirroring. */}
        <div className={copyFirst ? "lg:order-1" : "lg:order-2"}>{copy}</div>
        <div className={copyFirst ? "lg:order-2" : "lg:order-1"}>{cards}</div>
      </div>
    </section>
  );
}
