import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAllInsights, getFeaturedInsights, toCardModel } from "@/lib/blogs-api";
import SectionHeader from "./SectionHeader";
import SmartLink from "./SmartLink";
import { PAGE_INSET } from "./layout";
import { toneOf } from "./tone";

/**
 * The most recent published Insights posts.
 *
 * The one block whose rows are not authored in place — an async Server
 * Component that reads the Blog collection, so the band stays correct as posts
 * are published without anyone reopening the page in the admin panel.
 *
 * A failed fetch renders nothing rather than an empty shell: the rest of the
 * page is still worth serving, and a heading over a blank row looks broken in a
 * way that an absent band does not.
 */
export default async function InsightsFeed({ props }) {
  const { heading, subtitle, count, featuredOnly, link } = props;
  const { bg, text } = toneOf("lilac");

  const posts = featuredOnly
    ? await getFeaturedInsights()
    : await getAllInsights();

  const cards = (posts || []).slice(0, count || 3).map(toCardModel);
  if (cards.length === 0) return null;

  return (
    <section className={`${bg} py-12 md:py-20 ${PAGE_INSET}`}>
      <div className="mx-auto w-full max-w-[1180px]">
        <SectionHeader heading={heading} subtitle={subtitle} tone="lilac" />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <Link
              key={card.link}
              href={card.link}
              className="group flex h-full flex-col overflow-hidden rounded-[16px] bg-white shadow-lg transition-shadow duration-300 hover:shadow-xl"
            >
              <div className="relative aspect-video w-full overflow-hidden">
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  style={{ objectPosition: card.imageFocus || "center" }}
                />
              </div>

              <div className="flex flex-1 flex-col p-6">
                {card.category && (
                  <span className="text-[12px] font-semibold uppercase tracking-wide text-[#8b93b8]">
                    {card.category}
                  </span>
                )}

                <h3 className="mt-1 text-[19px] font-semibold leading-snug text-[#0e1726]">
                  {card.title}
                </h3>

                {card.description && (
                  <p className={`mt-2 text-[15px] leading-6 ${text.body}`}>
                    {card.description}
                  </p>
                )}

                <span className="mt-auto flex items-center gap-1.5 pt-5 text-[14px] font-semibold text-[#37469e]">
                  Read more
                  <ArrowRight size={14} aria-hidden="true" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center">
          <SmartLink
            href={link?.href}
            label={link?.label}
            className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-[#37469e] hover:underline"
          >
            {link?.label}
            <ArrowRight size={16} aria-hidden="true" />
          </SmartLink>
        </div>
      </div>
    </section>
  );
}
