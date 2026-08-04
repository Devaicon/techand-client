import CardRail from "./CardRail";
import CollectionCta from "./CollectionCta";
import ServiceCardTile from "./ServiceCardTile";
import { PAGE_INSET } from "./layout";

/**
 * A heading, a line of supporting copy, and a list of cards presented one of
 * four ways. The same cards drive all of them, so an author can switch a section
 * from a grid to a rail without re-entering its contents.
 *
 * Every layout can close with a call to action, because whether a collection
 * ends in a button is independent of how its cards are arranged. `CollectionCta`
 * renders nothing when none of its fields are filled, so the collections that
 * ignore it are unchanged.
 *
 * Stays a server component; only the rail needs browser state, so only the rail
 * ships JavaScript.
 */
export default function CardCollection({ props }) {
  const { layout, heading, subtitle, ctaHeading, ctaBody, link, secondaryLink } =
    props;
  const cards = props.cards || [];

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

  // One element, placed by each layout where its own container ends. Built here
  // rather than four times below so the four layouts cannot drift apart.
  const cta = (
    <CollectionCta
      heading={ctaHeading}
      body={ctaBody}
      link={link}
      secondaryLink={secondaryLink}
      dark={layout === "panel"}
    />
  );

  if (layout === "panel") {
    return (
      <section className={`bg-[#fef9f3] py-12 md:py-16 ${PAGE_INSET}`}>
        <div className="w-full rounded-[24px] bg-[#37469e] px-6 py-12 sm:px-10 md:py-16">
          {header}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => (
              <ServiceCardTile key={card.id} card={card} variant="panel" />
            ))}
          </div>
          {/* Inside the blue panel, not under it: a button floating on the cream
              below would read as belonging to the next section. */}
          {cta}
        </div>
      </section>
    );
  }

  if (layout === "photo") {
    return (
      <section className={`bg-[#fef9f3] py-12 md:py-16 ${PAGE_INSET}`}>
        <div className="w-full">
          {header}
          {/* A fixed three-up grid, not the default's centred wrap: these tiles
              are all the same height, so a short trailing row reads as part of
              the grid rather than as an orphan needing to be centred. */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => (
              <ServiceCardTile key={card.id} card={card} variant="overlay" />
            ))}
          </div>
          {cta}
        </div>
      </section>
    );
  }

  if (layout === "rail") {
    return (
      // The rail is the one band that is NOT inset. Its track runs the full page
      // width so cards scroll out to the viewport edges instead of stopping
      // short at a container boundary — the bleed is what reads as "there is
      // more this way". The heading keeps the shared inset so it still lines up
      // with the hero and every other section.
      <section className="bg-[#fef9f3] py-12 md:py-16">
        <div className={PAGE_INSET}>{header}</div>
        <CardRail cards={cards} />
        {/* Back inside the inset, like the heading: the bleed belongs to the
            scrolling track alone. */}
        <div className={PAGE_INSET}>{cta}</div>
      </section>
    );
  }

  // grid — the default. Wraps and centres, so a trailing row of one or two
  // cards sits under the middle of the row above rather than hanging left.
  return (
    <section className={`bg-[#fef9f3] py-12 md:py-16 ${PAGE_INSET}`}>
      <div className="w-full">
        {header}
        <div className="flex flex-wrap justify-center gap-5">
          {cards.map((card) => (
            <div
              key={card.id}
              className="w-full sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-13.34px)]"
            >
              <ServiceCardTile key={card.id} card={card} variant="tile" />
            </div>
          ))}
        </div>
        {cta}
      </div>
    </section>
  );
}
