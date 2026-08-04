import Image from "next/image";

// next/image throws on an empty src, so a block saved without artwork would take
// the whole page down rather than just looking unfinished.
const PLACEHOLDER = "/Hero-img.webp";

/**
 * The rounded, shadowed photo panel that sits opposite a column of copy.
 *
 * Extracted from FeatureSplit because three callers now draw it — the split
 * band, the accordion band, and the merged band that carries one image for both
 * — and a photograph that is 4:3 with a 20px radius in one of them and not in
 * the others reads as a mistake rather than as a choice.
 *
 * `aspect` is the one thing callers vary: a band standing alone gets 4:3, and
 * the merged band gets a taller frame because it stands beside two blocks'
 * worth of copy. `fill` instead lets the frame stretch to whatever height its
 * grid row ends up.
 */
export default function ImageFrame({
  image,
  alt = "",
  aspect = "aspect-[4/3]",
  fill = false,
  sizes = "(max-width: 1024px) 100vw, 50vw",
  className = "",
}) {
  return (
    <div
      className={`relative w-full overflow-hidden rounded-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.10)] ${
        fill ? "h-full min-h-[280px]" : aspect
      } ${className}`}
    >
      <Image
        src={image?.url || PLACEHOLDER}
        alt={image?.alt || alt}
        fill
        sizes={sizes}
        className="object-cover"
        style={{
          // The author's crop correction, applied the way the blog reader
          // applies it: a badly framed stock photo is fixed in the admin panel,
          // not in CSS.
          objectPosition: image?.focus || "center",
          transform: image?.zoom > 1 ? `scale(${image.zoom})` : undefined,
        }}
      />
    </div>
  );
}
