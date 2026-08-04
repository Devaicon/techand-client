import Image from "next/image";
import Breadcrumb from "@/components/shared/Breadcrumb";

const CapabilitiesHero = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="relative flex w-full items-center overflow-hidden py-16 min-h-[clamp(320px,50vh,560px)]">
        {/* Background Image */}
        <Image
          src="/contact-page-heroimg.webp"
          alt="Tech& Capabilities"
          fill
          priority
          className="
           object-cover
           brightness-[1.05]
           contrast-[1.15]
           saturate-[1.1]
         "
        />

        {/* Gradient Overlay (UNCHANGED) */}
        <div
          className="absolute inset-0 mix-blend-multiply"
          style={{
            background:
              "linear-gradient(180deg, rgba(69, 85, 167, 1) 0%, rgba(83, 64, 107, 1) 100%) ",
          }}
        />

        {/* Content */}
        <div className="relative z-10 w-full px-6 sm:px-12 md:px-16 lg:px-24 xl:px-32">
          <Breadcrumb />
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4">
            Tech& Capabilities
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-xl">
            Enterprise platforms, AI, and integration services
          </p>
        </div>
      </section>
    </>
  );
};

export default CapabilitiesHero;
