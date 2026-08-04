import { Check } from "lucide-react";
import SectionHeader from "./SectionHeader";
import SmartLink from "./SmartLink";
import { PAGE_INSET } from "./layout";
import { toneOf } from "./tone";

/**
 * Pricing or engagement tiers.
 *
 * A featured tier is lifted rather than merely recoloured — colour alone would
 * carry the emphasis for sighted users only, and the scale change survives
 * being read in greyscale.
 */
export default function Pricing({ props }) {
  const { heading, subtitle, tiers, footnote } = props;
  const { bg, text } = toneOf("cream");

  if (!tiers?.length) return null;

  return (
    <section className={`${bg} py-12 md:py-20 ${PAGE_INSET}`}>
      <div className="mx-auto w-full max-w-[1180px]">
        <SectionHeader heading={heading} subtitle={subtitle} tone="cream" />

        <div className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`flex flex-col rounded-[18px] p-7 ${
                tier.featured
                  ? "bg-gradient-to-b from-[#4555a7] to-[#53406b] text-white shadow-xl lg:-my-3 lg:py-10"
                  : "border border-gray-100 bg-white shadow-sm"
              }`}
            >
              {tier.featured && (
                <span className="mb-3 inline-block self-start rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide">
                  Most popular
                </span>
              )}

              <h3
                className={`text-[20px] font-bold ${
                  tier.featured ? "text-white" : "text-[#0e1726]"
                }`}
              >
                {tier.title}
              </h3>

              {tier.price && (
                <p className="mt-2 flex items-baseline gap-1.5">
                  <span
                    className={`text-[34px] font-bold leading-none ${
                      tier.featured ? "text-white" : "text-[#37469e]"
                    }`}
                  >
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span
                      className={`text-[14px] ${
                        tier.featured ? "text-white/70" : "text-[#8b93b8]"
                      }`}
                    >
                      {tier.period}
                    </span>
                  )}
                </p>
              )}

              {tier.body && (
                <p
                  className={`mt-3 text-[15px] leading-6 ${
                    tier.featured ? "text-white/85" : text.body
                  }`}
                >
                  {tier.body}
                </p>
              )}

              {tier.features?.length > 0 && (
                <ul className="mt-5 space-y-2.5">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2.5">
                      <Check
                        size={17}
                        className={`mt-0.5 shrink-0 ${
                          tier.featured ? "text-white" : "text-[#37469e]"
                        }`}
                        aria-hidden="true"
                      />
                      <span
                        className={`text-[15px] leading-6 ${
                          tier.featured ? "text-white/90" : text.body
                        }`}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              <SmartLink
                href={tier.link?.href}
                label={tier.link?.label}
                className="mt-auto pt-6"
              >
                <span
                  className={`inline-flex h-11 w-full items-center justify-center rounded-[8px] font-semibold transition-all duration-300 ${
                    tier.featured
                      ? "bg-white text-[#37469e] hover:shadow-lg"
                      : "bg-gradient-to-b from-[#4555a7] to-[#53406b] text-white hover:shadow-lg"
                  }`}
                >
                  {tier.link?.label}
                </span>
              </SmartLink>
            </div>
          ))}
        </div>

        {footnote && (
          <p className={`mt-6 text-center text-[14px] ${text.muted}`}>{footnote}</p>
        )}
      </div>
    </section>
  );
}
