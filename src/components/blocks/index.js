import AccordionBlock from "./AccordionBlock";
import Banner from "./Banner";
import CardCollection from "./CardCollection";
import Comparison from "./Comparison";
import ContactFormBlock from "./ContactFormBlock";
import CtaBand from "./CtaBand";
import FeatureSplit from "./FeatureSplit";
import HeaderShort from "./HeaderShort";
import HeaderTall from "./HeaderTall";
import HeaderWithPanel from "./HeaderWithPanel";
import InsightsFeed from "./InsightsFeed";
import Logos from "./Logos";
import Methodology from "./Methodology";
import PartnerBadgeBlock from "./PartnerBadgeBlock";
import PlatformBlock from "./PlatformBlock";
import Pricing from "./Pricing";
import RichText from "./RichText";
import Stages from "./Stages";
import Stats from "./Stats";
import Tabs from "./Tabs";
import Testimonials from "./Testimonials";
import TimelineAccordion from "./TimelineAccordion";

// Block type → the component that renders it.
//
// This is the client's half of the block registry. The server owns what a block
// *contains* (its fields, its validation, its defaults, served by
// `GET /admin/blocks`); this file owns what a block *looks like*. Adding a block
// means one entry here and one `*.block.js` on the server — and no hand-written
// admin form, because the inspector is generated from the server's descriptors.
//
// The keys must match the server's `type` values. A type present on the server
// and missing here renders nothing (see BlockRenderer), which is the degradation
// that lets the two repos deploy independently.
//
// A module-level object, looked up by property access at the call site rather
// than through a `resolve(type)` helper: the React Compiler lint rule
// `react-hooks/static-components` cannot see through a function call and reports
// "Cannot create components during render".
export const BLOCK_COMPONENTS = {
  // Headers
  "header-tall": HeaderTall,
  "header-short": HeaderShort,
  "header-panel": HeaderWithPanel,

  // Content
  "rich-text": RichText,
  platform: PlatformBlock,
  "feature-split": FeatureSplit,
  collection: CardCollection,
  methodology: Methodology,
  tabs: Tabs,
  stages: Stages,
  "timeline-accordion": TimelineAccordion,
  comparison: Comparison,
  accordion: AccordionBlock,

  // Social proof
  stats: Stats,
  logos: Logos,
  testimonials: Testimonials,

  // Conversion
  banner: Banner,
  pricing: Pricing,
  cta: CtaBand,

  // Site sections
  "insights-feed": InsightsFeed,
  "contact-form": ContactFormBlock,
  "partner-badge": PartnerBadgeBlock,
};
