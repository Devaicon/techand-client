import Image from "next/image";
import { Check } from "lucide-react";
import Accordion from "@/components/shared/Accordion";
import { ICON_REGISTRY } from "@/lib/iconRegistry";
import SectionHeader from "./SectionHeader";
import { PAGE_INSET } from "./layout";
import { toneOf } from "./tone";

/**
 * The explainer band: labelled columns of prose beside a photograph, then an
 * accordion of detail under a heading of its own.
 *
 * The columns carry no card. They are one continuous argument read top to
 * bottom — boxing each one would cut the argument into tiles and make the
 * label, not the prose, the thing the eye lands on.
 *
 * Reuses the shared `Accordion`, which is domain-agnostic and already accessible
 * — the alternative is a fourth hand-rolled disclosure list on this site.
 */
export default function Methodology({ props }) {
  const {
    heading,
    subtitle,
    columns,
    items,
    image,
    imageCaption,
    itemsImage,
    itemsHeading,
    itemsSubtitle,
  } = props;
  const { bg, text } = toneOf("cream");

  const accordionItems = (items || []).map((item) => ({
    id: item.id,
    title: item.title,
    content: (
      <p className="text-[15px] leading-7 text-[#4a5565]">{item.body}</p>
    ),
  }));

  // A pill row needs the page's full width. Inside the explainer column the
  // four application names wrap to four lines and stop reading as a set, so
  // those columns are lifted out and run beneath the grid.
  const visibleColumns = (columns || []).filter((column) => !column.hidden);
  const proseColumns = visibleColumns.filter((c) => c.display !== "pills");
  const pillColumns = visibleColumns.filter((c) => c.display === "pills");

  return (
    <section className={`${bg} py-12 md:py-20 ${PAGE_INSET}`}>
      <div className="mx-auto w-full max-w-[1180px]">
        <SectionHeader
          heading={heading}
          subtitle={subtitle}
          tone="cream"
          align="left"
        />

        {/* Artwork sits beside its half, not above the section. Without an
            upload each half falls back to full width, so a page authored before
            the images arrive is laid out correctly rather than reserving an
            empty column. */}
        <div
          className={
            image?.url ? "grid items-stretch gap-8 lg:grid-cols-[1fr_0.9fr]" : ""
          }
        >
          {proseColumns.length > 0 && (
            <div className={`grid gap-8 ${image?.url ? "" : "md:grid-cols-2"}`}>
              {proseColumns.map((column) => (
                <ProseColumn key={column.id} column={column} text={text} />
              ))}
            </div>
          )}

          {image?.url && (
            <div className="flex flex-col gap-3">
              {/* Explicit heights rather than an aspect ratio: on wide screens
                  the photo matches the prose beside it, which is what makes the
                  two halves read as one band. */}
              <div className="relative h-[260px] w-full overflow-hidden rounded-[20px] shadow-lg sm:h-[360px] lg:h-auto lg:min-h-[360px] lg:flex-1">
                <Image
                  src={image.url}
                  alt={image.alt || ""}
                  fill
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover"
                  style={{ objectPosition: image.focus || "center" }}
                />
              </div>
              {imageCaption && (
                <p className="text-[13px] font-semibold uppercase tracking-wide text-[#37469e]">
                  {imageCaption}
                </p>
              )}
            </div>
          )}
        </div>

        {pillColumns.map((column) => (
          <div key={column.id} className="mt-12">
            <ColumnLabel column={column} />
            {column.bullets?.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-3">
                {column.bullets.map((bullet, index) => (
                  <li
                    key={index}
                    className="inline-flex items-center gap-2 rounded-full bg-[#f2f2f7] px-5 py-2.5 text-[14px] text-[#37469e]"
                  >
                    <Check size={15} className="shrink-0" aria-hidden="true" />
                    {bullet}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}

        {accordionItems.length > 0 && (
          <div className="mt-12">
            <SectionHeader
              heading={itemsHeading}
              subtitle={itemsSubtitle}
              tone="cream"
              align="left"
            />

            <div
              className={
                itemsImage?.url
                  ? "grid items-start gap-8 lg:grid-cols-[1fr_0.9fr]"
                  : ""
              }
            >
              {/* No wrapper card: `Accordion` draws its own border, and nesting
                  one inside another put two rounded outlines a pixel apart. */}
              <Accordion items={accordionItems} defaultOpen={0} />

              {itemsImage?.url && (
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[20px] shadow-lg">
                  <Image
                    src={itemsImage.url}
                    alt={itemsImage.alt || ""}
                    fill
                    sizes="(max-width: 1024px) 100vw, 45vw"
                    className="object-cover"
                    style={{ objectPosition: itemsImage.focus || "center" }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function ColumnLabel({ column }) {
  const Glyph =
    column.icon?.kind === "lucide" && column.icon?.name
      ? ICON_REGISTRY[column.icon.name] || null
      : null;

  return (
    <div className="mb-3 flex items-center gap-2.5">
      {Glyph && (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#4655a51a]">
          <Glyph className="h-4 w-4 text-[#37469e]" aria-hidden="true" />
        </span>
      )}
      <h3 className="text-[13px] font-semibold uppercase tracking-wide text-[#37469e]">
        {column.title}
      </h3>
    </div>
  );
}

function ProseColumn({ column, text }) {
  // Prose splits on blank lines so a deliberate paragraph break reads as one,
  // rather than as another wrapped line.
  const paragraphs = (column.body || "")
    .split(/\n{2,}/)
    .filter((p) => p.trim());

  return (
    <div>
      <ColumnLabel column={column} />

      {paragraphs.map((paragraph, index) => (
        <p key={index} className={`mb-4 text-[15px] leading-7 ${text.body}`}>
          {paragraph}
        </p>
      ))}

      {column.bullets?.length > 0 && (
        <ul className="mt-4 space-y-4">
          {column.bullets.map((bullet, index) => (
            <li key={index} className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#4653a2] to-[#683b80]"
              >
                <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
              </span>
              <span className="text-[15px] leading-7 text-[#4a5565]">
                {bullet}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
