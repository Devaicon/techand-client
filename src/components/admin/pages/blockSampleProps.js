// Representative props for previewing a block before it is added.
//
// A block's `defaults` are deliberately empty — a newly added block should not
// arrive carrying copy nobody wrote. That makes them useless for a preview:
// almost every block returns null with no rows, so a palette rendered from
// defaults is a grid of blank rectangles.
//
// So the sample is derived from the field descriptors instead. It is never
// saved and never leaves the palette; its only job is to make the shape of a
// block legible. Anything it cannot infer falls back to the field's own label,
// which at worst reads as a placeholder and never as a lie.

// Copy chosen by field name where the name is conventional, so a heading reads
// like a heading rather than like the word "heading".
const TEXT_BY_NAME = {
  eyebrow: "Section label",
  heading: "A heading for this section",
  headline: "A heading for this section",
  title: "Card title",
  subtitle: "One line of supporting copy that sits under the heading.",
  subheading: "Supporting line",
  caption: "2 weeks",
  tagline: "Short tagline",
  imageEyebrow: "Photo label",
  imageTitle: "Copy over the image",
  imageBody: "A supporting line over the photograph.",
  imageCaption: "Image caption",
  itemsHeading: "A heading for the list below",
  itemsSubtitle: "One line introducing the list.",
  author: "Sam Rivera",
  role: "Finance Director",
  result: "Close cut from 12 days to 4",
  tag: "Manufacturing",
  price: "From AED 45,000",
  summary: "A one-line summary of the story.",
  label: "Label",
  name: "Name",
};

const BODY =
  "Two or three lines of body copy, long enough to show how the block handles a real paragraph rather than a single word.";

// A real file in `public/`, and the same one the card tiles fall back to, so a
// preview never asks next/image to load an empty src.
const SAMPLE_IMAGE = { url: "/Hero-img.webp", alt: "", focus: "center", zoom: 1 };

const sampleText = (field) =>
  TEXT_BY_NAME[field.name] || field.label || field.name;

// Rows are numbered so a repeater reads as a list of distinct things rather
// than as the same card three times.
const numbered = (value, index) =>
  index === 0 ? value : `${value} ${index + 1}`;

const sampleValue = (field, defaults, index) => {
  switch (field.control) {
    case "text":
      return numbered(sampleText(field), index);
    case "textarea":
      return field.name === "body" || field.name === "description"
        ? BODY
        : numbered(sampleText(field), index);
    case "list":
      return ["First point", "Second point", "Third point"];
    case "link":
      return { label: "Learn more", href: "#" };
    case "image":
      return SAMPLE_IMAGE;
    case "icon":
      return { kind: "lucide", name: "Sparkles" };
    case "number":
      return defaults?.[field.name] ?? 3;
    case "toggle":
      // Never true by default: a `hidden` toggle flipped on would render a
      // preview of nothing at all.
      return defaults?.[field.name] ?? false;
    case "select":
      // The block's own default, which the server sets to the first option.
      return defaults?.[field.name] ?? field.options?.[0]?.value;
    case "repeater":
      return [0, 1, 2].map((i) => ({
        id: `sample-${field.name}-${i}`,
        ...sampleFields(field.of, defaults, i),
      }));
    default:
      return defaults?.[field.name];
  }
};

const sampleFields = (fields, defaults, index = 0) => {
  const out = {};
  for (const field of fields || []) {
    out[field.name] = sampleValue(field, defaults, index);
  }
  return out;
};

/**
 * Sample props for one block definition, as served by `GET /admin/blocks`.
 */
export default function blockSampleProps(definition) {
  return sampleFields(definition.fields, definition.defaults);
}

/**
 * A one-line description of what an author will be filling in — "Heading,
 * subtitle, 1 repeating list, 2 links". Read off the same descriptors, so it
 * stays true as blocks change.
 */
export function blockFieldSummary(definition) {
  const fields = definition.fields || [];
  const counts = { links: 0, images: 0, repeaters: [] };

  for (const field of fields) {
    if (field.control === "link") counts.links += 1;
    if (field.control === "image") counts.images += 1;
    if (field.control === "repeater") {
      counts.repeaters.push(field.rowLabel || field.name);
    }
  }

  const parts = [];
  const named = fields.filter((f) =>
    ["text", "textarea", "select", "toggle", "number", "list"].includes(
      f.control,
    ),
  ).length;

  if (named) parts.push(`${named} copy field${named === 1 ? "" : "s"}`);
  for (const label of counts.repeaters) parts.push(`repeating ${label}s`);
  if (counts.images) {
    parts.push(`${counts.images} image${counts.images === 1 ? "" : "s"}`);
  }
  if (counts.links) {
    parts.push(`${counts.links} link${counts.links === 1 ? "" : "s"}`);
  }

  return parts.join(" · ");
}
