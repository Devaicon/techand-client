import Image from "next/image";
import { ICON_REGISTRY } from "@/lib/iconRegistry";
import SectionHeader from "./SectionHeader";
import SmartLink from "./SmartLink";
import { PAGE_INSET } from "./layout";
import { toneOf } from "./tone";

/**
 * A strip of partner or platform marks.
 *
 * A logo with no image falls back to its name as text rather than rendering an
 * empty tile — a wordmark is a perfectly good logo, and it means an author can
 * build this band before the assets arrive.
 */
export default function Logos({ props }) {
  const {
    heading,
    subtitle,
    image,
    imageEyebrow,
    imageTitle,
    imageBody,
    imageChips,
    logos,
    layout,
    tone,
  } = props;
  const { bg } = toneOf(tone);

  if (!logos?.length) return null;

  if (layout === "panel") {
    return (
      <section className={`${bg} py-12 md:py-20 ${PAGE_INSET}`}>
        <div className="mx-auto grid w-full max-w-[1180px] items-center gap-8 md:grid-cols-2 md:gap-12">
          <div>
            {/* Heading inside the column, not above the band: the photo beside
                it is the same height as this whole half, so a centred header
                over both would leave the pills hanging under nothing. */}
            <SectionHeader
              heading={heading}
              subtitle={subtitle}
              tone={tone}
              align="left"
            />

            <ul className="grid gap-3 sm:grid-cols-2">
              {logos.map((logo) => {
                const Glyph =
                  logo.icon?.kind === "lucide" && logo.icon?.name
                    ? ICON_REGISTRY[logo.icon.name] || null
                    : null;

                return (
                  <li
                    key={logo.id}
                    className="flex items-center gap-3 rounded-[12px] bg-white px-4 py-3 shadow-sm"
                  >
                    {Glyph ? (
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#eceafa]">
                        <Glyph
                          className="h-[18px] w-[18px] text-[#37469e]"
                          aria-hidden="true"
                        />
                      </span>
                    ) : (
                      <span
                        aria-hidden="true"
                        className="h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-r from-[#4653a2] to-[#683b80]"
                      />
                    )}
                    <span className="text-[15px] font-medium text-[#0e1726]">
                      {logo.title}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* The caption sits over the photo when there is one and stands on
              the gradient when there is not, so the band is legible before
              anyone uploads artwork. */}
          <div className="relative min-h-[420px] overflow-hidden rounded-[20px] bg-gradient-to-br from-[#4653a2] to-[#683b80] shadow-lg">
            {image?.url && (
              <Image
                src={image.url}
                alt={image.alt || ""}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                style={{ objectPosition: image.focus || "center" }}
              />
            )}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-[#2d1b3d]/92 via-[#2d1b3d]/55 to-[#2d1b3d]/10"
            />

            <div className="absolute inset-x-0 bottom-0 p-8">
              {imageEyebrow && (
                <span className="mb-2 block text-[12px] font-semibold uppercase tracking-wide text-white/75">
                  {imageEyebrow}
                </span>
              )}
              {imageTitle && (
                <p className="whitespace-pre-line text-[26px] font-bold leading-9 text-white">
                  {imageTitle}
                </p>
              )}
              {imageBody && (
                <p className="mt-2 max-w-[420px] text-[15px] leading-6 text-white/80">
                  {imageBody}
                </p>
              )}
              {imageChips?.length > 0 && (
                <ul className="mt-5 flex flex-wrap gap-2">
                  {imageChips.map((chip) => (
                    <li
                      key={chip}
                      className="rounded-full bg-white/15 px-3 py-1 text-[13px] text-white backdrop-blur-sm"
                    >
                      {chip}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`${bg} py-12 md:py-16 ${PAGE_INSET}`}>
      <div className="mx-auto w-full max-w-[1180px]">
        <SectionHeader heading={heading} subtitle={subtitle} tone={tone} />

        <div className="flex flex-wrap items-center justify-center gap-4">
          {logos.map((logo) => {
            const mark = logo.image?.url ? (
              <Image
                src={logo.image.url}
                alt={logo.image.alt || logo.title}
                width={160}
                height={56}
                className="h-10 w-auto object-contain opacity-80 transition-opacity duration-300 group-hover:opacity-100"
              />
            ) : (
              <span className="text-[17px] font-semibold text-[#4a5565]">
                {logo.title}
              </span>
            );

            return (
              <div
                key={logo.id}
                className="group flex h-[88px] w-[168px] items-center justify-center rounded-[14px] border border-gray-100 bg-white px-5 shadow-sm"
              >
                {/* Most logos are not links. SmartLink renders nothing without a
                    destination, so the two cases are told apart here rather than
                    rendering the mark twice and relying on one of them
                    collapsing. */}
                {logo.link?.href ? (
                  <SmartLink
                    href={logo.link.href}
                    label={logo.link.label || logo.title}
                    className="flex items-center justify-center"
                  >
                    {mark}
                  </SmartLink>
                ) : (
                  mark
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
