import { AccordionBody } from "./AccordionBlock";
import CopyStack from "./CopyStack";
import ImageFrame from "./ImageFrame";
import SectionHeader from "./SectionHeader";
import { PAGE_INSET } from "./layout";
import { toneOf } from "./tone";

/**
 * An "image beside copy" explainer and the accordion beneath it, drawn as one
 * band under a single tall photograph.
 *
 * Paired by BlockRenderer, not by either block: whether two blocks merge is a
 * fact about the page, and neither of them can see the other. They stay two
 * separate sections in the database, orderable and deletable independently —
 * this only changes how a particular adjacency is drawn.
 *
 * The explainer owns the image and the tone, because it is the lead. The
 * accordion contributes its heading, its subtitle and its questions, and its own
 * `align`, `image` and `tone` are ignored for as long as it is sharing — which
 * is why the field's help text says so.
 *
 * `ids` is set only in the editor's preview. Both the copy column and the image
 * carry the explainer's id, so clicking either selects the block the picture
 * actually belongs to; the accordion's half of the column carries its own. They
 * are siblings rather than nested, so hovering one does not also outline the
 * other.
 */
export default function SharedImageBand({ explainer, accordion, ids = null }) {
  const tone = explainer.tone;
  const { bg } = toneOf(tone);
  const copyFirst = explainer.align !== "right";

  return (
    <section className={`${bg} py-12 md:py-20 ${PAGE_INSET}`}>
      <div className="grid w-full items-start gap-8 lg:grid-cols-2 lg:gap-14">
        <div className={copyFirst ? "lg:order-1" : "lg:order-2"}>
          <div data-block-id={ids?.explainer}>
            <CopyStack props={explainer} tone={tone} />
          </div>

          {/* A rule, not just a gap. The two halves share a column, and without
              a divider the accordion's heading reads as one more `sections` row
              belonging to the explainer above it. */}
          <div
            data-block-id={ids?.accordion}
            className="mt-10 border-t border-black/5 pt-10"
          >
            <SectionHeader
              heading={accordion.heading}
              subtitle={accordion.subtitle}
              tone={tone}
              align="left"
              className="mb-6"
            />
            <AccordionBody items={accordion.items} />
          </div>
        </div>

        <div
          data-block-id={ids?.explainer}
          className={copyFirst ? "lg:order-2" : "lg:order-1"}
        >
          {/* Taller than a lone split band's 4:3, because it stands beside two
              blocks' worth of copy — and sticky, so it is still on screen when
              the reader reaches the questions at the bottom of that copy. */}
          <div className="lg:sticky lg:top-24">
            <ImageFrame
              image={explainer.image}
              alt={explainer.heading}
              aspect="aspect-[4/3] lg:aspect-[4/5]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
