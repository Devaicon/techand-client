// The single source of truth for icons that can be named by string.
//
// Three components (CapabilitesContainer, CapabilityDetailCard,
// CapabilityStickyNav) each used to carry an identical hand-maintained copy of
// this map. That was survivable while every icon name was hardcoded in
// `lib/*-data.js` alongside them — but the admin panel now lets an author pick
// an icon, and a name present in one copy and missing from another would render
// a broken image in one place and a correct icon in the others.
//
// Adding an icon here makes it available to the admin picker AND to every
// renderer at once.

import {
  Activity,
  BarChart3,
  Bot,
  Boxes,
  Brain,
  Briefcase,
  Building2,
  Cloud,
  CloudCog,
  Code2,
  Compass,
  Cpu,
  Database,
  DollarSign,
  Factory,
  FileText,
  Gauge,
  GitBranch,
  Globe,
  GraduationCap,
  Hammer,
  Headphones,
  Heart,
  Layers,
  LayoutGrid,
  LifeBuoy,
  Lightbulb,
  LineChart,
  Lock,
  MapPin,
  Megaphone,
  MessageSquare,
  Monitor,
  Network,
  Package,
  PieChart,
  Plug,
  Rocket,
  Search,
  Server,
  Settings,
  Shield,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Store,
  Target,
  TrendingUp,
  Users,
  Workflow,
  Wrench,
  Zap,
} from "lucide-react";

export const ICON_REGISTRY = {
  Activity,
  BarChart3,
  Bot,
  Boxes,
  Brain,
  Briefcase,
  Building2,
  Cloud,
  CloudCog,
  Code2,
  Compass,
  Cpu,
  Database,
  DollarSign,
  Factory,
  FileText,
  Gauge,
  GitBranch,
  Globe,
  GraduationCap,
  Hammer,
  Headphones,
  Heart,
  Layers,
  LayoutGrid,
  LifeBuoy,
  Lightbulb,
  LineChart,
  Lock,
  MapPin,
  Megaphone,
  MessageSquare,
  Monitor,
  Network,
  Package,
  PieChart,
  Plug,
  Rocket,
  Search,
  Server,
  Settings,
  Shield,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Store,
  Target,
  TrendingUp,
  Users,
  Workflow,
  Wrench,
  Zap,
};

export const ICON_NAMES = Object.keys(ICON_REGISTRY);

// Look icons up by indexing ICON_REGISTRY directly at the call site:
//
//   const IconComponent = ICON_REGISTRY[card.icon] || null;
//
// NOT through a `resolveIcon(card.icon)` helper. The React Compiler lint rule
// `react-hooks/static-components` cannot see through a function call and reports
// "Cannot create components during render" for every caller. A property access
// on a module-level object is statically obvious and passes.
//
// A miss returns undefined, which every caller treats as "this is an image path
// or Cloudinary URL, render it as an image" — the name-or-url union the
// capability and services data have always used. Non-string keys coerce to a
// miss, so no type guard is needed.

/** Case-insensitive substring search over the registry, for the admin picker. */
export const searchIcons = (query) => {
  const q = (query || "").trim().toLowerCase();
  if (!q) return ICON_NAMES;
  return ICON_NAMES.filter((name) => name.toLowerCase().includes(q));
};
