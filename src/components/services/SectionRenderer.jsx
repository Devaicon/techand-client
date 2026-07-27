import CardCollection from "./CardCollection";
import CtaBand from "./CtaBand";
import PlatformBlock from "./PlatformBlock";

// Section type → component. A module-level object, looked up by property access
// at the call site rather than through a `resolve(type)` helper: the React
// Compiler lint rule `react-hooks/static-components` cannot see through a
// function call and reports "Cannot create components during render".
const SECTION_COMPONENTS = {
  platform: PlatformBlock,
  collection: CardCollection,
  cta: CtaBand,
};

/**
 * Renders the page body from the admin's section list, in author order.
 *
 * An unknown `type` renders nothing instead of throwing. That is what lets the
 * server grow a fourth section type without breaking a client that has not been
 * redeployed yet — the new band is simply absent until it has.
 */
export default function SectionRenderer({ sections }) {
  return (
    <>
      {sections.map((section) => {
        const Component = SECTION_COMPONENTS[section.type] || null;
        if (!Component) return null;
        return <Component key={section.id} section={section} />;
      })}
    </>
  );
}
