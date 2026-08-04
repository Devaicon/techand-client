import HeaderTall from "./HeaderTall";
import HeaderShort from "./HeaderShort";
import SplitTabsCard from "./SplitTabsCard";
import { PAGE_INSET } from "./layout";
import { toneOf } from "./tone";

// The overlap presets, in pixels. One value drives both halves of the effect:
// the header reserves this much extra background at its foot, and the card is
// pulled up by the same amount — so the card always overlaps clean background,
// never the header's own content.
const OVERLAP = { none: 0, subtle: 40, medium: 80, bold: 120 };

/**
 * A header with a tabbed copy-and-photo panel that rises onto it.
 *
 * It composes two existing blocks rather than reinventing them: the tall or
 * compact header (chosen by `variant`) and `SplitTabsCard` (the `tabs` block's
 * split layout). What this block adds is the seam between them — the overlap the
 * reference design uses, where the card straddles the header's bottom edge and
 * sits on top. Building it as one block, not two placed blocks, is deliberate:
 * the overlap needs the two pieces to agree on a single measurement, and sibling
 * blocks in the page list cannot.
 *
 * No hooks here — it is a server component that only wires props through. The one
 * interactive part, the tab strip, lives inside `SplitTabsCard`, which is a
 * client component of its own.
 */
export default function HeaderWithPanel({ props }) {
  const {
    variant,
    eyebrow,
    headline,
    subheading,
    body,
    image,
    primary,
    secondary,
    showBreadcrumb,
    dim,
    overlap,
    background,
    panelEyebrow,
    panelHeading,
    panelSubtitle,
    photo,
    photoEyebrow,
    photoTitle,
    photoBody,
    tabs,
    panelLink,
  } = props;

  const room = OVERLAP[overlap] ?? OVERLAP.medium;
  const { bg } = toneOf(background || "lilac");

  const header =
    variant === "compact" ? (
      <HeaderShort
        props={{ title: headline, subtitle: subheading, image, showBreadcrumb, dim }}
        overlapRoom={room}
      />
    ) : (
      <HeaderTall
        props={{
          eyebrow,
          headline,
          subheading,
          body,
          image,
          primary,
          secondary,
          showBreadcrumb,
        }}
        overlapRoom={room}
      />
    );

  return (
    <>
      {header}

      {/* The band the card lands on. Its top edge is the header's bottom edge, so
          only the card — pulled up out of this band — overlaps the header; the
          band's own colour never bleeds up onto the gradient. When there is no
          overlap the band takes a normal top gap instead. */}
      <div
        className={`${bg} pb-12 md:pb-20 ${room > 0 ? "" : "pt-12 md:pt-20"} ${PAGE_INSET}`}
      >
        <div
          className="relative z-10"
          style={room > 0 ? { marginTop: -room } : undefined}
        >
          <SplitTabsCard
            eyebrow={panelEyebrow}
            heading={panelHeading}
            subtitle={panelSubtitle}
            tabs={tabs}
            image={photo}
            imageEyebrow={photoEyebrow}
            imageTitle={photoTitle}
            imageBody={photoBody}
            link={panelLink}
          />
        </div>
      </div>
    </>
  );
}
