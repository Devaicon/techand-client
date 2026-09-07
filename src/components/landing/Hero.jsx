import ReactDOM from "react-dom";
import HeroCarousel from "./HeroCarousel";

// Every hero background is pre-encoded at three widths in `public/`
// (`Hero-img-828.webp`, `-1280`, `-1920`), so a phone pulls ~26 KB instead of
// the ~87 KB desktop encode. `images.unoptimized` is on, so nothing generates
// these at request time — adding a slide means adding its three files too.
const HERO_WIDTHS = [828, 1280, 1920];

const heroSrcSet = (path) => {
  const base = path.replace(/\.webp$/, "");
  return HERO_WIDTHS.map((w) => `${base}-${w}.webp ${w}w`).join(", ");
};

// Slide data configuration
// To add more slides, simply add more objects to this array
const heroSlides = [
  {
    backgroundImage: "/Hero-img.webp",
    title: "Value Driven Innovation through Automation",
    description:
      "Tech& helps GCC enterprises move beyond the limits of traditional CRM & ERP software.",
    primaryButton: {
      text: "Read More",
      href: "/insights/value-driven-innovation-automation",
    },
    secondaryButton: {
      text: "Talk to Sales",
      href: "/contact-us",
    },
  },
  {
    backgroundImage: "/hero-img3.webp",
    title: "Agentic AI is Revolutionizing the Industries",
    description:
      "Stop struggling with disconnected data systems. We apply Agentic AI to banking, retail, and other GCC industries.",
    primaryButton: {
      text: "Read More",
      href: "/insights/agentic-ai",
    },
    secondaryButton: {
      text: "Talk to Sales",
      href: "/contact-us",
    },
  },
  {
    backgroundImage: "/hero-img4.webp",
    title: "Data is Going to Be Your New Sovereign Asset",
    description:
      "Your company's data is your most valuable resource. We solve the problem of data silos by building a unified platform.",
    primaryButton: {
      text: "Read More",
      href: "/insights/data-sovereign-asset",
    },
    secondaryButton: {
      text: "Talk to Sales",
      href: "/contact-us",
    },
  },
  {
    backgroundImage: "/hero-img2.webp",
    title:
      "How Customer Service Teams Are Achieving a 20% to 45% Increase in Productivity with AI",
    description:
      "Companies using AI-driven tools like Microsoft Copilot see a 20% to 45% increase in the speed of resolving customer inquiries.",
    primaryButton: {
      text: "Read More",
      href: "/insights/autonomous-ai-customer-service",
    },
    secondaryButton: {
      text: "Talk to Sales",
      href: "/contact-us",
    },
  },
  // Example: Add more slides here
  // {
  //   backgroundImage: "/hero-slide-2.webp",
  //   title: "Your Second Slide Title",
  //   description: "Your second slide description goes here.<br />You can use HTML line breaks.",
  //   primaryButton: {
  //     text: "Learn More",
  //     href: "/learn-more",
  //   },
  //   secondaryButton: {
  //     text: "Contact Us",
  //     href: "/contact",
  //   },
  // },
];

const slidesWithSrcSet = heroSlides.map((slide) => ({
  ...slide,
  backgroundSrcSet: heroSrcSet(slide.backgroundImage),
}));

export default function Hero() {
  // The first slide's background is the page's LCP element. Preloading it from
  // the server component puts the <link> in the document head, ahead of the
  // stylesheets, so the fetch starts in the same round trip as the HTML instead
  // of waiting for the carousel markup to be parsed.
  ReactDOM.preload(slidesWithSrcSet[0].backgroundImage, {
    as: "image",
    fetchPriority: "high",
    imageSrcSet: slidesWithSrcSet[0].backgroundSrcSet,
    imageSizes: "100vw",
  });

  return (
    <HeroCarousel
      slides={slidesWithSrcSet}
      autoplay={true}
      autoplayInterval={5000}
    />
  );
}
