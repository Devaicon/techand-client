import { ICON_REGISTRY } from "@/lib/iconRegistry";
import SectionHeader from "./SectionHeader";
import { PAGE_INSET } from "./layout";
import { toneOf } from "./tone";

/**
 * A row of headline numbers.
 *
 * The grid column count is derived from how many stats there are rather than
 * fixed at three: four stats in a three-column grid leaves one stranded on its
 * own row, which reads as a mistake.
 */
const COLUMNS = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

export default function Stats({ props }) {
  const { heading, subtitle, stats, tone } = props;
  const { bg, text, onBrand } = toneOf(tone);

  if (!stats?.length) return null;

  const columns = COLUMNS[Math.min(stats.length, 4)] || COLUMNS[4];

  return (
    <section className={`${bg} py-12 md:py-16 ${PAGE_INSET}`}>
      <div className="mx-auto w-full max-w-[1180px]">
        <SectionHeader heading={heading} subtitle={subtitle} tone={tone} />

        <div className={`grid grid-cols-1 gap-5 ${columns}`}>
          {stats.map((stat) => {
            const Glyph =
              stat.icon?.kind === "lucide" && stat.icon?.name
                ? ICON_REGISTRY[stat.icon.name] || null
                : null;

            return (
              <div
                key={stat.id}
                className={`rounded-[16px] p-6 text-center ${
                  onBrand
                    ? "bg-white/10 backdrop-blur-sm"
                    : "border border-gray-100 bg-white shadow-sm"
                }`}
              >
                {Glyph && (
                  <span
                    className={`mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${
                      onBrand ? "bg-white/15" : "bg-[#4655a51a]"
                    }`}
                  >
                    <Glyph
                      className={`h-5 w-5 ${onBrand ? "text-white" : "text-[#37469e]"}`}
                      aria-hidden="true"
                    />
                  </span>
                )}

                <p
                  className={`text-[34px] font-bold leading-tight sm:text-[40px] ${
                    onBrand ? "text-white" : "text-[#37469e]"
                  }`}
                >
                  {stat.title}
                </p>

                {stat.caption && (
                  <p className={`mt-1 text-[15px] leading-6 ${text.body}`}>
                    {stat.caption}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
