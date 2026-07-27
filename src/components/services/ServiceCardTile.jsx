import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { ICON_REGISTRY } from "@/lib/iconRegistry";
import SmartLink from "./SmartLink";

// next/image throws on an empty src, so a card saved without artwork would take
// the whole page down rather than just looking unfinished.
const PLACEHOLDER_IMAGE = "/Hero-img.webp";

// The author's crop correction, applied the same way the blog reader applies it:
// a badly framed stock photo is fixed in the admin panel, not in CSS.
const cropStyle = (image) => ({
  objectPosition: image?.focus || "center",
  transform: image?.zoom > 1 ? `scale(${image.zoom})` : undefined,
});

/**
 * One card. The same data shape renders three ways because the reference asks
 * for three treatments of the same content:
 *
 *   tile    — image on top, filled button. Grid and rail.
 *   panel   — white card on the blue band. Icon, name, tagline, filled button.
 *   compact — the small icon rows beside a platform block's heading.
 *
 * Fields render only when present, so a card needs no per-variant shape.
 */
export default function ServiceCardTile({ card, variant = "tile" }) {
  const IconComponent =
    card.icon?.kind === "lucide" && card.icon?.name
      ? ICON_REGISTRY[card.icon.name] || null
      : null;
  const iconUrl = card.icon?.kind === "image" ? card.icon.url : "";

  // ── compact: platform sub-card ────────────────────────────────────────────
  if (variant === "compact") {
    return (
      <div className="rounded-[12px] border border-gray-100 bg-white p-5 shadow-sm transition-shadow duration-300 hover:shadow-md">
        {(IconComponent || iconUrl) && (
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[#4655a51a]">
            {IconComponent ? (
              <IconComponent className="h-5 w-5 text-[#37469e]" aria-hidden="true" />
            ) : (
              <Image
                src={iconUrl}
                alt={card.icon?.alt || ""}
                width={20}
                height={20}
                className="h-5 w-5 object-contain"
              />
            )}
          </div>
        )}

        <h4 className="text-[17px] font-semibold text-[#0e1726]">
          {card.title}
        </h4>

        {card.description && (
          <p className="mt-1 text-[14px] leading-6 text-[#4a5565]">
            {card.description}
          </p>
        )}

        <SmartLink
          href={card.link?.href}
          label={card.link?.label}
          className="mt-3 inline-flex items-center gap-1 text-[14px] font-semibold text-[#37469e] hover:underline"
        >
          {card.link?.label}
          <ArrowRight size={14} aria-hidden="true" />
        </SmartLink>
      </div>
    );
  }

  // ── panel: white card on the blue band ────────────────────────────────────
  if (variant === "panel") {
    return (
      <div className="flex h-full flex-col rounded-[16px] bg-white p-6 text-left shadow-lg">
        {card.eyebrow && (
          <span className="text-[12px] font-semibold uppercase tracking-wide text-[#8b93b8]">
            {card.eyebrow}
          </span>
        )}

        <h3 className="mt-1 text-[24px] font-bold text-[#0e1726]">
          {card.title}
        </h3>

        {card.tagline && (
          <p className="text-[15px] font-semibold text-[#37469e]">
            {card.tagline}
          </p>
        )}

        {card.description && (
          <p className="mt-2 text-[15px] leading-6 text-[#4a5565]">
            {card.description}
          </p>
        )}

        <SmartLink
          href={card.link?.href}
          label={card.link?.label}
          className="mt-auto pt-5"
        >
          <span className="inline-flex h-11 w-full items-center justify-center rounded-[8px] bg-gradient-to-b from-[#4555a7] to-[#53406b] font-semibold text-white transition-all duration-300 hover:from-[#5266bf] hover:to-[#654e7f] hover:shadow-lg">
            {card.link?.label}
          </span>
        </SmartLink>
      </div>
    );
  }

  // ── tile: grid and rail ───────────────────────────────────────────────────
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[16px] bg-white shadow-lg">
      <div className="relative h-[194px] w-full overflow-hidden">
        <Image
          src={card.image?.url || PLACEHOLDER_IMAGE}
          alt={card.image?.alt || card.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
          style={cropStyle(card.image)}
        />
      </div>

      <div className="flex flex-1 flex-col p-6 text-left">
        {card.eyebrow && (
          <span className="text-[12px] font-semibold uppercase tracking-wide text-[#8b93b8]">
            {card.eyebrow}
          </span>
        )}

        <h3 className="mt-1 text-[20px] font-normal text-[#0e1726]">
          {card.title}
        </h3>

        {card.tagline && (
          <p className="text-[14px] font-semibold text-[#37469e]">
            {card.tagline}
          </p>
        )}

        {card.description && (
          <p className="mt-2 text-[15px] leading-6 text-[#4a5565]">
            {card.description}
          </p>
        )}

        <SmartLink
          href={card.link?.href}
          label={card.link?.label}
          className="mt-auto pt-5"
        >
          <span className="inline-flex h-11 items-center justify-center rounded-[8px] bg-gradient-to-b from-[#4555a7] to-[#53406b] px-6 font-semibold text-white transition-all duration-300 hover:from-[#5266bf] hover:to-[#654e7f] hover:shadow-lg">
            {card.link?.label}
          </span>
        </SmartLink>
      </div>
    </div>
  );
}
