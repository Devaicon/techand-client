import Image from "next/image";

// Heights only. Width stays `auto` so the asset keeps its own 245x64 (3.82:1)
// ratio. Sizing goes through these tokens rather than a className override:
// two `h-*` utilities in the same Tailwind layer are resolved by stylesheet
// order, not by the order they appear in the class attribute.
const SIZE_CLASSES = {
  sm: "h-8",
  md: "h-10",
  lg: "h-16",
};

// The two colourways of the lockup. `light` is the white-on-transparent artwork
// that ships today; `dark` is the ink-on-transparent version placed alongside it
// for light surfaces. The path is resolved here — the one place the asset lives —
// so no caller has to know either filename.
const VARIANT_ASSETS = {
  light: "/microsoft-partner.svg",
  dark: "/microsoft-partner-dark.svg",
};

/**
 * Microsoft Partner badge — the single place the asset path and plaque styling
 * live. Used by the navbar, the home Enterprise Excellence section, the footer,
 * and the insights Featured blogs card.
 *
 * There are two colourways, chosen with `variant`:
 *
 *   - `light` (default) — /microsoft-partner.svg, a white-on-transparent asset:
 *     every fill is #ffffff and the "Microsoft Partner" wordmark is 18 white
 *     paths. On a light background the wordmark vanishes and only the four
 *     coloured squares survive, so this MUST sit on a dark backdrop — via
 *     `plaque` plus a dark `className`, or on an already-dark section.
 *   - `dark` — /microsoft-partner-dark.svg, the ink-on-transparent counterpart
 *     for light cards, where the white artwork would disappear.
 *
 * The caller owns the pairing: pick the variant whose wordmark contrasts with
 * the surface it lands on. Getting it wrong is exactly the "invisible logo on
 * white" the `dark` variant exists to prevent.
 *
 * `plaque` adds the chrome (rounding + inset padding) used where the badge sits
 * on a light surface and needs its own dark tile, i.e. the navbar. It is opt-in
 * because the other three placements are already on dark backgrounds and want
 * the bare mark. The padding lives here rather than in the base class string so
 * callers are never in the position of trying to cancel it from `className` —
 * `p-0` would lose to `px-2.5` on stylesheet order, the same trap the `h-*`
 * note above describes.
 */
const MicrosoftPartnerBadge = ({
  size = "md",
  plaque = false,
  variant = "light",
  className = "",
}) => {
  return (
    <div
      className={`inline-flex items-center ${
        plaque ? "rounded-lg py-2 px-2.5" : ""
      } ${className}`}
    >
      <Image
        src={VARIANT_ASSETS[variant] ?? VARIANT_ASSETS.light}
        alt="Microsoft Partner"
        width={245}
        height={64}
        className={`w-auto object-contain pe-1 ${SIZE_CLASSES[size] ?? SIZE_CLASSES.md}`}
      />
    </div>
  );
};

export default MicrosoftPartnerBadge;
