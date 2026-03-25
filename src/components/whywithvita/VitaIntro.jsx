"use client";

import Image from "next/image";
import { Globe, Eye, Lightbulb } from "lucide-react";
import VitaCoreValues from "./VitaCoreValues";

const VitaIntro = () => {
  const introItems = [
    {
      id: 1,
      icon: Globe,
      title: "Our Mission",
      description:
        "Our vision is to be a trusted transformation partner for enterprises, enabling smarter decisions, efficient operations, and sustainable growth. We aim to help organizations fully realize the value of AI, data innovation, and digital transformation as the foundation for measurable outcomes and long-term business success.",
    },
    {
      id: 2,
      icon: Eye,
      title: "Our Vision",
      description:
        "Our vision is to empower enterprises to lead with clarity, intelligence, and confidence. We strive to make AI, data, and cloud platforms practical, trusted, and outcome-driven, helping organizations operate smarter, adapt faster, and achieve sustained business growth in complex and evolving markets.",
    },
    {
      id: 3,
      icon: Lightbulb,
      title: "Our Purpose",
      description:
        "Our purpose is to simplify enterprise complexity. We help organizations adopt and leverage transformative technologies. We combine deep expertise, hands-on support, and holistic partnership to make operations more transparent, more intelligent, and deliver measurable outcomes and long-term business success.",
    },
  ];

  return (
    <section
      className="w-full py-8 sm:py-10 md:py-12 lg:py-14 xl:py-16"
      style={{ backgroundColor: "#FEF9F3" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        {/* Section Title */}
        <div className="mb-8 sm:mb-10 md:mb-12 lg:mb-14 xl:mb-16 flex flex-col items-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 text-center">
            Why Us
          </h2>
          <p className="mt-4 sm:mt-5 md:mt-6 lg:mt-7 text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 text-center w-full leading-relaxed">
            At Tech&, we help organizations turn technology into measurable
            business impact. Turning technology into measurable business
            impacts, we combine strong stability with deep industry expertise
            across the GCC. Our teams deliver trusted Microsoft, AI, and data
            platforms that improve efficiency, reduce risk, and support
            long-term enterprise growth with confidence.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12 xl:gap-16 items-stretch w-full">
          {/* Left Side - Cards */}
          <div className="flex flex-col gap-4 sm:gap-5 md:gap-6 lg:gap-8">
            {introItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={item.id}
                  className="flex gap-3 sm:gap-4 md:gap-6 lg:gap-8 animate-fade-in"
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  {/* Icon Container */}
                  <div className="flex-shrink-0 pt-1">
                    <div
                      className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300"
                      style={{
                        background:
                          "linear-gradient(180deg, #4555A7 0%, #53406B 100%)",
                      }}
                    >
                      <IconComponent className="w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9 lg:w-12 lg:h-12 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex flex-col justify-center gap-1 sm:gap-2 md:gap-2 lg:gap-3">
                    <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-700 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Side - Image */}
          <div className="flex items-center justify-center relative w-full h-auto min-h-80 sm:min-h-96 md:min-h-[450px] lg:min-h-[500px]">
            {/* Gradient Circle Background */}
            <div
              className="absolute w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 lg:w-[480px] lg:h-[480px] xl:w-[550px] xl:h-[550px] rounded-full"
              // style={{
              //   background: "linear-gradient(180deg, #3E234C 0%, #6C3C85 100%)",
              //    left: "0",
              //   top: "50%",
              //   transform: "translateY(-50%)",
              //   zIndex: 1,
              // }}
            />

            <div className="relative w-full aspect-square max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl z-10">
              {/* Circular Image Container */}
              <div className="absolute inset-0 rounded-full overflow-hidden shadow-2xl">
                <Image
                  src="/images/about_us.webp"
                  alt="Tech& Team"
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* Decorative Circle Border */}
              <div className="absolute inset-0 rounded-full border-4 sm:border-6 md:border-8 border-white opacity-30" />
            </div>
          </div>
        </div>

        {/* Bottom Divider */}
      </div>

      <VitaCoreValues />
    </section>
  );
};

export default VitaIntro;
