import CopyStack from "./CopyStack";
import ImageFrame from "./ImageFrame";
import { PAGE_INSET } from "./layout";
import { toneOf } from "./tone";

/**
 * A photograph on one side, copy on the other.
 *
 * Source order is copy-then-image regardless of side, so a screen reader always
 * hears what the band is about before reaching its artwork; `lg:order-*` does
 * the visual mirroring.
 *
 * The copy column itself lives in CopyStack, because an accordion directly below
 * this block can opt to share its image — and when it does, SharedImageBand
 * renders this exact column beside one taller photograph.
 */
export default function FeatureSplit({ props }) {
  const { heading, image, align, tone } = props;
  const { bg } = toneOf(tone);
  const copyFirst = align !== "right";

  return (
    <section className={`${bg} py-12 md:py-20 ${PAGE_INSET}`}>
      {/* `items-start`, not `items-center`: with a `sections` list the copy
          column can run well past the image, and centring it then leaves the
          photograph floating in the middle of a long band. */}
      <div className="grid w-full items-start gap-8 lg:grid-cols-2 lg:gap-14">
        <div className={copyFirst ? "lg:order-1" : "lg:order-2"}>
          <CopyStack props={props} tone={tone} />
        </div>

        <div className={copyFirst ? "lg:order-2" : "lg:order-1"}>
          {/* Sticky so a tall stack of sections scrolls past a photograph that
              stays in view, rather than past an empty column. Only above `lg`,
              where the two are side by side at all. */}
          <div className="lg:sticky lg:top-24">
            <ImageFrame image={image} alt={heading} />
          </div>
        </div>
      </div>
    </section>
  );
}
