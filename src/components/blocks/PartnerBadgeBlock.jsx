import { ArrowRight } from "lucide-react";
import MicrosoftPartnerBadge from "@/components/shared/MicrosoftPartnerBadge";
import SmartLink from "./SmartLink";
import { PAGE_INSET } from "./layout";
import { toneOf } from "./tone";

/**
 * The Microsoft Solutions Partner lockup as a placeable band.
 *
 * The badge itself comes from the shared component rather than being re-laid-out
 * here — it owns the two colourways and the asset paths, so this block only has
 * to name which one to use.
 *
 * Two tones stack: `tone` colours the outer band, `cardTone` the tile the badge
 * sits on. That tile used to be hard-coded white, which made the white-on-
 * transparent lockup vanish; giving the card its own tone is what lets an author
 * pair a dark card with the light logo (or, once the dark artwork is placed, a
 * light card with the dark logo). The badge and the card text both follow the
 * card's tone, so a dark card gets the light lockup, white text and a hairline
 * border without any per-combination guesswork.
 */
export default function PartnerBadgeBlock({ props }) {
  const { heading, body, link, tone, cardTone, logo } = props;
  const { bg } = toneOf(tone);
  // Fall back to the descriptor's default pairing (dark card + light logo), not
  // white — a prop-less render must not land back on the invisible white-on-white
  // lockup this field exists to fix.
  const { bg: cardBg, text: cardText, dark } = toneOf(cardTone || "ink");

  return (
    <section className={`${bg} py-12 md:py-16 ${PAGE_INSET}`}>
      <div
        className={`mx-auto flex w-full max-w-[1000px] flex-col items-center gap-7 rounded-[20px] border p-8 text-center shadow-sm md:flex-row md:gap-10 md:text-left ${cardBg} ${
          dark ? "border-white/15" : "border-gray-100"
        }`}
      >
        <div className="shrink-0">
          <MicrosoftPartnerBadge size="lg" variant={logo === "dark" ? "dark" : "light"} />
        </div>

        <div className="min-w-0">
          {heading && (
            <h2 className={`text-[22px] font-bold sm:text-[26px] ${cardText.heading}`}>
              {heading}
            </h2>
          )}
          {body && (
            <p className={`mt-2 text-[15px] leading-7 sm:text-base ${cardText.body}`}>
              {body}
            </p>
          )}
          <SmartLink
            href={link?.href}
            label={link?.label}
            className={`mt-3 inline-flex items-center gap-1.5 text-[15px] font-semibold hover:underline ${
              dark ? "text-white" : "text-[#37469e]"
            }`}
          >
            {link?.label}
            <ArrowRight size={16} aria-hidden="true" />
          </SmartLink>
        </div>
      </div>
    </section>
  );
}
