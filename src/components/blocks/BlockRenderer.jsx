import { BLOCK_COMPONENTS } from "./index";
import SharedImageBand from "./SharedImageBand";

/**
 * Renders a page body from its block list, in author order.
 *
 * An unknown `type` renders nothing instead of throwing. That is what lets the
 * server grow a new block type without breaking a client that has not been
 * redeployed yet — the new band is simply absent until it has. Given the client
 * and server are separate repos that deploy independently, that is not a
 * hypothetical ordering.
 *
 * Blocks receive `props` alone, never the section wrapper. Visibility and order
 * are the page's business and have already been applied by the time a block is
 * called; passing them through would invite a block to re-decide them.
 *
 * `editable` wraps each block in a positioned host carrying `data-block-id`,
 * which is what the editor's preview iframe clicks, scrolls to and highlights.
 * It is off for every ordinary visit — a live page ships no editor scaffolding
 * and no extra wrapper elements to perturb the layout.
 */

/**
 * Does this accordion want to be drawn under the previous block's image?
 *
 * Three things have to be true, and all three are checked here rather than in
 * either block: only the page knows what sits next to what. A `shareImage`
 * accordion that finds nothing to share with falls back to rendering itself,
 * which is the right failure — an author who reorders their page should see the
 * band come apart, not see it disappear.
 */
const sharesImageWith = (previous, section) =>
  section.type === "accordion" &&
  Boolean(section.props?.shareImage) &&
  previous?.type === "feature-split" &&
  Boolean(previous.props?.image?.url);

// Walks the section list once, folding each shared pair into a single unit. A
// pre-pass rather than a look-behind inside the map, because the explainer of a
// pair must NOT also be rendered on its own — and a map cannot skip an element
// it has already emitted.
const toUnits = (sections) => {
  const units = [];

  for (const section of sections) {
    const previous = units[units.length - 1];

    if (previous?.kind === "block" && sharesImageWith(previous.section, section)) {
      units[units.length - 1] = {
        kind: "shared",
        explainer: previous.section,
        accordion: section,
      };
      continue;
    }

    units.push({ kind: "block", section });
  }

  return units;
};

export default function BlockRenderer({ sections, editable = false }) {
  return (
    <>
      {toUnits(sections).map((unit) => {
        if (unit.kind === "shared") {
          return (
            <SharedImageBand
              key={unit.explainer.id}
              explainer={unit.explainer.props || {}}
              accordion={unit.accordion.props || {}}
              // The merged band places these itself, one per half, so the two
              // blocks stay separately selectable inside a single section.
              ids={
                editable
                  ? {
                      explainer: unit.explainer.id,
                      accordion: unit.accordion.id,
                    }
                  : null
              }
            />
          );
        }

        const { section } = unit;
        const Component = BLOCK_COMPONENTS[section.type] || null;
        if (!Component) return null;

        const rendered = (
          <Component key={section.id} props={section.props || {}} />
        );

        if (!editable) return rendered;

        return (
          <div key={section.id} data-block-id={section.id}>
            {rendered}
          </div>
        );
      })}
    </>
  );
}
