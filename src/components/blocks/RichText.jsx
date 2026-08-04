import { ArrowRight, Check } from "lucide-react";
import SectionHeader from "./SectionHeader";
import SmartLink from "./SmartLink";
import { PAGE_INSET } from "./layout";
import { toneOf } from "./tone";

/**
 * Heading, prose and an optional bullet list.
 *
 * Body copy is split on blank lines into paragraphs rather than rendered as one
 * block of text with `whitespace-pre-line`. Pre-line preserves the author's
 * newlines but gives every line the same spacing, so a deliberate paragraph
 * break reads the same as an accidental one.
 */
export default function RichText({ props }) {
  const { eyebrow, heading, body, bullets, link, align, tone } = props;
  const { bg, text } = toneOf(tone);
  const centred = align === "center";

  const paragraphs = (body || "").split(/\n{2,}/).filter((p) => p.trim());

  return (
    <section className={`${bg} py-12 md:py-16 ${PAGE_INSET}`}>
      <div className={`w-full ${centred ? "mx-auto max-w-[820px]" : "max-w-[860px]"}`}>
        <SectionHeader
          eyebrow={eyebrow}
          heading={heading}
          tone={tone}
          align={align}
          className="mb-5"
        />

        {paragraphs.map((paragraph, index) => (
          <p
            key={index}
            className={`mb-4 text-base leading-7 sm:text-[17px] ${text.body} ${
              centred ? "text-center" : ""
            }`}
          >
            {paragraph}
          </p>
        ))}

        {bullets?.length > 0 && (
          <ul className={`mt-6 space-y-2.5 ${centred ? "inline-block text-left" : ""}`}>
            {bullets.map((bullet, index) => (
              <li key={index} className="flex items-start gap-2.5">
                <Check
                  size={18}
                  className="mt-0.5 shrink-0 text-[#37469e]"
                  aria-hidden="true"
                />
                <span className={`text-base leading-7 ${text.body}`}>{bullet}</span>
              </li>
            ))}
          </ul>
        )}

        <div className={centred ? "text-center" : ""}>
          <SmartLink
            href={link?.href}
            label={link?.label}
            className="mt-6 inline-flex items-center gap-1.5 text-[15px] font-semibold text-[#37469e] hover:underline"
          >
            {link?.label}
            <ArrowRight size={16} aria-hidden="true" />
          </SmartLink>
        </div>
      </div>
    </section>
  );
}
