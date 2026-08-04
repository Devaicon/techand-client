import { ArrowRight, Check } from "lucide-react";
import SmartLink from "./SmartLink";
import { toneOf } from "./tone";

/**
 * The copy column of an "image beside copy" band.
 *
 * Split out of FeatureSplit so the merged image band can render exactly the same
 * column beside a shared photograph, rather than a near-copy of it that drifts
 * the first time the type scale is touched.
 *
 * The block's own heading and body are the lead; `sections` repeats that same
 * heading-and-copy unit underneath as many times as the author needs. A block
 * with no sections renders precisely what it did before the field existed.
 */

function BulletList({ bullets, text, className = "mt-5" }) {
  if (!bullets?.length) return null;

  return (
    <ul className={`${className} space-y-2.5`}>
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
  );
}

export default function CopyStack({ props, tone }) {
  const { eyebrow, heading, body, bullets, sections, link } = props;
  const { text } = toneOf(tone);

  // `withoutHiddenRows` already drops hidden rows on the public read, but the
  // editor's preview renders the unfiltered bundle — so honour the flag here too
  // or a hidden section would still show while it was being edited.
  const extra = (sections || []).filter((section) => !section.hidden);

  return (
    <>
      {eyebrow && (
        <span
          className={`mb-2 block text-[12px] font-semibold uppercase tracking-wide ${text.muted}`}
        >
          {eyebrow}
        </span>
      )}

      <h2 className={`text-[26px] font-bold sm:text-[34px] ${text.heading}`}>
        {heading}
      </h2>

      {body && (
        <p className={`mt-4 text-base leading-7 sm:text-[17px] ${text.body}`}>
          {body}
        </p>
      )}

      <BulletList bullets={bullets} text={text} />

      {extra.map((section, index) => (
        // A step down in size from the lead heading, not a repeat of it: these
        // are subdivisions of the band's subject, and three h2s of equal weight
        // in one column reads as three bands that failed to separate.
        <div key={section.id || index} className="mt-8">
          <h3
            className={`text-[19px] font-semibold sm:text-[21px] ${text.heading}`}
          >
            {section.heading}
          </h3>

          {section.body && (
            <p className={`mt-2 text-base leading-7 ${text.body}`}>
              {section.body}
            </p>
          )}

          <BulletList bullets={section.bullets} text={text} className="mt-3" />
        </div>
      ))}

      <SmartLink
        href={link?.href}
        label={link?.label}
        className="mt-6 inline-flex items-center gap-1.5 text-[15px] font-semibold text-[#37469e] hover:underline"
      >
        {link?.label}
        <ArrowRight size={16} aria-hidden="true" />
      </SmartLink>
    </>
  );
}
