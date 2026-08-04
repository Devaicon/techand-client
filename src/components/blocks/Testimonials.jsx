import Image from "next/image";
import { ArrowRight, Quote } from "lucide-react";
import SectionHeader from "./SectionHeader";
import SmartLink from "./SmartLink";
import { PAGE_INSET } from "./layout";
import { toneOf } from "./tone";

/**
 * Customer quotes with attribution, and optionally a result line.
 *
 * One quote gets the full width and larger type; two or more become a grid.
 * A single testimonial in a three-column grid reads as two missing ones.
 */
export default function Testimonials({ props }) {
  const { heading, subtitle, quotes, variant } = props;
  const { bg, text } = toneOf("cream");

  if (!quotes?.length) return null;

  // A case-study card is a headline, a supporting line, a tag and a link — no
  // attribution, because there is no speaker. The block carries `author`,
  // `role` and `result` for the quote variant and they stay empty here; see the
  // block definition on the server for why the two share one block.
  if (variant === "case-study") {
    return (
      <section className={`${bg} py-12 md:py-20 ${PAGE_INSET}`}>
        <div className="mx-auto w-full max-w-[1180px]">
          <SectionHeader heading={heading} subtitle={subtitle} tone="cream" />

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {quotes.map((study) => (
              <article
                key={study.id}
                className="flex h-full flex-col overflow-hidden rounded-[18px] border border-gray-100 bg-white shadow-sm"
              >
                {/* Photo on top, as the design has it. Unlike the card tiles
                    there is no placeholder fallback: a case study with no
                    artwork is a text card, not a card with a stock photo
                    standing in for evidence. */}
                {study.image?.url && (
                  <div className="relative h-[180px] w-full overflow-hidden">
                    <Image
                      src={study.image.url}
                      alt={study.image.alt || study.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                      style={{ objectPosition: study.image.focus || "center" }}
                    />
                  </div>
                )}

                <div className="flex flex-1 flex-col p-7">
                  {study.tag && (
                    <span className="mb-4 inline-block self-start rounded-full bg-[#4655a51a] px-3 py-1 text-[12px] font-semibold uppercase tracking-wide text-[#37469e]">
                      {study.tag}
                    </span>
                  )}

                  <h3 className={`text-[18px] font-semibold ${text.heading}`}>
                    {study.title}
                  </h3>

                  {study.summary && (
                    <p className={`mt-2 text-[15px] leading-7 ${text.body}`}>
                      {study.summary}
                    </p>
                  )}

                  <SmartLink
                    href={study.link?.href}
                    label={study.link?.label}
                    className="mt-auto inline-flex items-center gap-1.5 pt-6 text-[14px] font-semibold text-[#37469e] hover:underline"
                  >
                    {study.link?.label}
                    <ArrowRight size={14} aria-hidden="true" />
                  </SmartLink>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const solo = quotes.length === 1;

  return (
    <section className={`${bg} py-12 md:py-20 ${PAGE_INSET}`}>
      <div className="mx-auto w-full max-w-[1180px]">
        <SectionHeader heading={heading} subtitle={subtitle} tone="cream" />

        <div
          className={
            solo
              ? "mx-auto max-w-[820px]"
              : "grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          }
        >
          {quotes.map((quote) => (
            <figure
              key={quote.id}
              className="flex h-full flex-col rounded-[18px] border border-gray-100 bg-white p-7 shadow-sm"
            >
              <Quote
                size={26}
                className="mb-3 shrink-0 text-[#37469e]/30"
                aria-hidden="true"
              />

              <blockquote
                className={`leading-7 ${text.heading} ${
                  solo ? "text-[20px] sm:text-[24px] sm:leading-9" : "text-[16px]"
                }`}
              >
                {quote.title}
              </blockquote>

              {quote.result && (
                <p className="mt-4 inline-block self-start rounded-full bg-[#4655a51a] px-3 py-1 text-[13px] font-semibold text-[#37469e]">
                  {quote.result}
                </p>
              )}

              <figcaption className="mt-auto flex items-center gap-3 pt-6">
                {quote.image?.url && (
                  <Image
                    src={quote.image.url}
                    alt={quote.image.alt || quote.author || ""}
                    width={44}
                    height={44}
                    className="h-11 w-11 shrink-0 rounded-full object-cover"
                  />
                )}
                <span className="min-w-0">
                  {quote.author && (
                    <span className="block truncate text-[15px] font-semibold text-[#0e1726]">
                      {quote.author}
                    </span>
                  )}
                  {quote.role && (
                    <span className="block truncate text-[13px] text-[#8b93b8]">
                      {quote.role}
                    </span>
                  )}
                </span>
              </figcaption>

              <SmartLink
                href={quote.link?.href}
                label={quote.link?.label}
                className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#37469e] hover:underline"
              >
                {quote.link?.label}
                <ArrowRight size={14} aria-hidden="true" />
              </SmartLink>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
