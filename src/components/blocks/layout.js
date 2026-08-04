// The horizontal inset every band on this page shares.
//
// It is copied from GenericHero's content wrapper, and that is the whole point:
// the hero's title and the headings below it must start on the same vertical
// line. Every other subpage that uses GenericHero (capabilities, whatwedo)
// already aligns to this; the services page originally used the landing page's
// centred `max-w-[1180px]` container instead, which the landing page gets away
// with only because it has no GenericHero above it. At 1920px that put the hero
// title at 128px and the section headings at 370px.
//
// Change this and you must change GenericHero to match, or the page loses its
// spine.
export const PAGE_INSET = "px-6 sm:px-12 md:px-16 lg:px-24 xl:px-32";
