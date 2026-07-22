import Image from "next/image";

// Heights only. Width stays `auto` so the asset keeps its own 152x64 (2.375:1)
// ratio. Sizing goes through these tokens rather than a className override:
// two `h-*` utilities in the same Tailwind layer are resolved by stylesheet
// order, not by the order they appear in the class attribute.
const SIZE_CLASSES = {
  sm: "h-6",
  md: "h-8",
  lg: "h-10",
};

/**
 * Microsoft Partner badge — the single place the asset path and plaque styling
 * live. Used by the navbar, the home Enterprise Excellence section, the footer,
 * and the insights Featured blogs card.
 *
 * The plaque is deliberately BLACK. /microsoft-partner.svg is a white-on-
 * transparent asset: every fill in it is #ffffff, and the "Microsoft Partner"
 * wordmark is 18 white paths. On a light background the wordmark vanishes and
 * only the four coloured squares survive. Do not switch this to bg-white.
 */
const MicrosoftPartnerBadge = ({ size = "md", className = "" }) => {
  return (
    <div
      className={`inline-flex items-center bg-black border border-white/10 rounded-lg px-2.5 py-1.5 ${className}`}
    >
      <Image
        src="/microsoft-partner.svg"
        alt="Microsoft Partner"
        width={152}
        height={64}
        className={`w-auto object-contain ${SIZE_CLASSES[size] ?? SIZE_CLASSES.md}`}
      />
    </div>
  );
};

export default MicrosoftPartnerBadge;
