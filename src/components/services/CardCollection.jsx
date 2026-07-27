import CardRail from "./CardRail";
import ServiceCardTile from "./ServiceCardTile";

/**
 * A heading, a line of supporting copy, and a list of cards presented one of
 * three ways. The same cards drive all three, so an author can switch a section
 * from a grid to a rail without re-entering its contents.
 *
 * Stays a server component; only the rail needs browser state, so only the rail
 * ships JavaScript.
 */
export default function CardCollection({ section }) {
  const { layout, heading, subtitle, cards } = section;

  // Nothing to show. Returning null rather than an empty grid keeps a
  // half-finished section from leaving a gap on the live page.
  if (!cards.length) return null;

  const header = (
    <div className="mb-8 text-center">
      {heading && (
        <h2
          className={`text-3xl font-bold sm:text-4xl md:text-[42px] ${
            layout === "panel" ? "text-white" : "text-[#0f172a]"
          }`}
        >
          {heading}
        </h2>
      )}
      {subtitle && (
        <p
          className={`mx-auto mt-2 max-w-[720px] text-base sm:text-lg ${
            layout === "panel" ? "text-white/80" : "text-[#475569]"
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );

  if (layout === "panel") {
    return (
      <section className="bg-[#fef9f3] px-4 py-12 sm:px-6 md:px-8 md:py-16">
        <div className="mx-auto w-full max-w-[1180px] rounded-[24px] bg-[#37469e] px-6 py-12 sm:px-10 md:py-16">
          {header}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => (
              <ServiceCardTile key={card.id} card={card} variant="panel" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (layout === "rail") {
    return (
      <section className="bg-[#fef9f3] px-4 py-12 sm:px-6 md:px-8 md:py-16">
        <div className="mx-auto w-full max-w-[1180px]">
          {header}
          <CardRail cards={cards} />
        </div>
      </section>
    );
  }

  // grid — the default. Wraps and centres, so a trailing row of one or two
  // cards sits under the middle of the row above rather than hanging left.
  return (
    <section className="bg-[#fef9f3] px-4 py-12 sm:px-6 md:px-8 md:py-16">
      <div className="mx-auto w-full max-w-[1180px]">
        {header}
        <div className="flex flex-wrap justify-center gap-5">
          {cards.map((card) => (
            <div
              key={card.id}
              className="w-full sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-13.34px)]"
            >
              <ServiceCardTile card={card} variant="tile" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
