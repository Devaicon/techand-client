import {
  AlignLeft,
  BadgeCheck,
  Boxes,
  CircleHelp,
  Columns2,
  CreditCard,
  Gauge,
  LayoutGrid,
  ListChecks,
  ListOrdered,
  ListTree,
  Mail,
  Megaphone,
  Minus,
  Newspaper,
  PanelTop,
  GalleryVerticalEnd,
  Quote,
  Scale,
  Square,
} from "lucide-react";

// Glyphs for the block palette and the block list, keyed by the `icon` name a
// block declares on the server.
//
// Deliberately NOT `lib/iconRegistry.js`: that registry is the author-facing
// icon picker for card content, and adding admin chrome to it would put
// "PanelTop" in the list of icons an author can pick for a service card.
//
// A block naming a glyph that is missing here renders `FALLBACK_GLYPH` — a block
// with a plain square beside it is a cosmetic gap, not a broken editor, so this
// map falling behind the server registry costs nothing that matters. That is why
// it is allowed to be a client-side map at all, unlike the field descriptors.
export const FALLBACK_GLYPH = Square;

export const BLOCK_GLYPHS = {
  AlignLeft,
  BadgeCheck,
  Boxes,
  CircleHelp,
  Columns2,
  CreditCard,
  GalleryVerticalEnd,
  Gauge,
  LayoutGrid,
  ListChecks,
  ListOrdered,
  ListTree,
  Mail,
  Megaphone,
  Minus,
  Newspaper,
  PanelTop,
  Quote,
  Scale,
};
