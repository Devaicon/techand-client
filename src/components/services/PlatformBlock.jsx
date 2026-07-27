import Image from "next/image";
import { ArrowRight } from "lucide-react";
import ServiceCardTile from "./ServiceCardTile";
import SmartLink from "./SmartLink";

/**
 * A platform band: heading, blurb and brand lockup on one side, a stack of
 * sub-cards on the other. `align` decides which side the copy sits on, so
 * consecutive blocks can mirror each other the way the reference does.
 */
export default function PlatformBlock({ section }) {
  const copyFirst = section.align !== "right";

  const copy = (
    <div className="flex flex-col justify-center">
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
        <div className="relative mt-8 h-[110px] w-full max-w-[340px]">
          <Image
            src={section.media.url}
            alt={section.media.alt || section.heading}
            fill
            sizes="340px"
            className="object-contain object-left"
          />
        </div>
      )}
    </div>
  );

  const cards = (
    <div className="flex flex-col gap-4">
      {section.cards.map((card) => (
        <ServiceCardTile key={card.id} card={card} variant="compact" />
      ))}
    </div>
  );

  return (
    <section className="bg-[#fef9f3] px-4 py-10 sm:px-6 md:px-8">
      <div className="mx-auto grid w-full max-w-[1180px] gap-8 rounded-[24px] bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)] sm:p-10 lg:grid-cols-2 lg:gap-12">
        {/* Source order is copy-then-cards regardless of side, so a screen
            reader always hears what the block is about before its contents.
            `lg:order-*` does the visual mirroring. */}
        <div className={copyFirst ? "lg:order-1" : "lg:order-2"}>{copy}</div>
        <div className={copyFirst ? "lg:order-2" : "lg:order-1"}>{cards}</div>
      </div>
    </section>
  );
}
