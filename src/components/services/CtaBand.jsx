import { ArrowRight } from "lucide-react";
import SmartLink from "./SmartLink";

/**
 * The closing call to action. Both buttons are optional — SmartLink renders
 * nothing for a link with no destination — so this works as a one-button band,
 * a two-button band, or a plain statement.
 */
export default function CtaBand({ section }) {
  return (
    <section className="bg-gradient-to-b from-[#4555a7] to-[#53406b] px-4 py-16 sm:px-6 md:px-8 md:py-20">
      <div className="mx-auto w-full max-w-[1180px] text-center">
        {section.heading && (
          <h2 className="text-3xl font-bold text-white sm:text-4xl md:text-[48px]">
            {section.heading}
          </h2>
        )}

        {section.subtitle && (
          <p className="mx-auto mt-4 max-w-[720px] text-base text-white/90 sm:text-lg">
            {section.subtitle}
          </p>
        )}

        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <SmartLink
            href={section.link?.href}
            label={section.link?.label}
            className="inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-[8px] bg-white px-8 font-semibold text-[#37469e] transition-shadow duration-300 hover:shadow-lg sm:w-auto"
          >
            {section.link?.label}
            <ArrowRight size={16} aria-hidden="true" />
          </SmartLink>

          <SmartLink
            href={section.secondaryLink?.href}
            label={section.secondaryLink?.label}
            className="inline-flex h-[52px] w-full items-center justify-center rounded-[8px] border-2 border-white/70 px-8 font-semibold text-white transition-colors duration-300 hover:bg-white/10 sm:w-auto"
          />
        </div>
      </div>
    </section>
  );
}
