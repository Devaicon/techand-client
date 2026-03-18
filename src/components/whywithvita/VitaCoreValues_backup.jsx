"use client";

import { Users, TrendingUp, Star, Users2, Lightbulb } from "lucide-react";

const VitaCoreValues = () => {
  const coreValues = [
    {
      id: 1,
      title: "People First",
      description:
        "We put people at the core of everything we do. We listen, support, and empower our teams to drive collaboration and shared success.",
      icon: Users,
      position: "top-left",
    },
    {
      id: 2,
      title: "Accountability",
      description:
        "We take ownership of results. We deliver quality work with integrity, taking responsibility for outcomes in all we do.",
      icon: TrendingUp,
      position: "top-right",
    },
    {
      id: 3,
      title: "Excellence",
      description:
        "We aim for continuous improvement and are committed to raising the bar on quality across all our operations.",
      icon: Star,
      position: "left",
    },
    {
      id: 4,
      title: "Integrity",
      description:
        "We act with honesty and transparency in all our interactions, building trust through consistent, principled behavior.",
      icon: Users2,
      position: "right",
    },
    {
      id: 5,
      title: "Innovation",
      description:
        "We embrace change and challenge the status quo. We test new ideas, learn from failures, and drive continuous improvement with confidence.",
      icon: Lightbulb,
      position: "bottom",
    },
  ];

  return (
    <section
      className="w-full py-6 sm:py-8 md:py-10 lg:py-12 xl:py-14"
      style={{ backgroundColor: "#FEF9F3" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        {/* Core Values Container */}
        <div
          className="rounded-2xl sm:rounded-3xl lg:rounded-[30px] p-6 sm:p-8 md:p-10 lg:p-12 xl:p-14 relative min-h-96 sm:min-h-[500px] md:min-h-[650px] lg:min-h-[750px]"
          style={{
            background: "linear-gradient(180deg, #4555A7 0%, #53406B 100%)",
          }}
        >
          {/* SVG Lines Container */}
          <svg
            className="absolute top-0 left-0 w-full h-full z-5"
            style={{ pointerEvents: "none" }}
          >
            {/* Line from top-left to center */}
            <line
              x1="30%"
              y1="10%"
              x2="50%"
              y2="50%"
              stroke="#1E3A5F"
              strokeWidth="2"
              strokeDasharray="5,5"
              opacity="0.6"
            />
            {/* Line from top-right to center */}
            <line
              x1="62%"
              y1="30%"
              x2="50%"
              y2="50%"
              stroke="#1E3A5F"
              strokeWidth="2"
              strokeDasharray="5,5"
              opacity="0.6"
            />
            {/* Line from left to center */}
            <line
              x1="30%"
              y1="44%"
              x2="50%"
              y2="45%"
              stroke="#1E3A5F"
              strokeWidth="2"
              strokeDasharray="5,5"
              opacity="0.6"
            />
            {/* Line from right to center */}
            <line
              x1="1000%"
              y1="60%"
              x2="50%"
              y2="42%"
              stroke="#1E3A5F"
              strokeWidth="2"
              strokeDasharray="5,5"
              opacity="0.6"
            />
            {/* Line from center to bottom */}
            <line
              x1="50%"
              y1="50%"
              x2="50%"
              y2="70%"
              stroke="#1E3A5F"
              strokeWidth="2"
              strokeDasharray="5,5"
              opacity="0.6"
            />
          </svg>

          {/* Dotted Circle Border */}
          <div className="absolute top-[42%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <div
              className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 rounded-full"
              style={{
                border: "2px dashed #1E3A5F",
              }}
            />
          </div>

          {/* Central Circle - CORE VALUES */}
          <div className="absolute top-[42%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
            <div
              className="w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-full flex flex-col items-center justify-center border-4 border-white/20"
              style={{
                background: "#37469E",
                boxShadow: "0px 3px 29px -17px #999999",
              }}
            >
              <p className="text-white text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-center px-4">
                CORE
              </p>
              <p className="text-white text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-center px-4">
                VALUES
              </p>
              <p className="text-white/70 text-[9px] sm:text-xs md:text-sm text-center mt-2 px-3 leading-tight">
                Our values shape how we work, partner, and deliver impact.
              </p>
            </div>
          </div>

          {/* Values Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4 lg:gap-6 relative z-10 h-full ">
            {/* People First - Top Left (icon RIGHT, text LEFT) */}
            <div className="flex flex-row-reverse items-start gap-2 sm:gap-3 md:col-span-1 md:justify-start">
              <div className="bg-white rounded-lg p-2 sm:p-3 shadow-lg flex-shrink-0">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-white mb-1">
                  {coreValues[0].title}
                </h3>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                  {coreValues[0].description}
                </p>
              </div>
            </div>

            {/* Accountability - Top Right (icon LEFT, text RIGHT) */}
            <div className="flex flex-row items-start gap-2 sm:gap-3 md:col-span-1 md:justify-start md:col-start-3">
              <div className="bg-white rounded-lg p-2 sm:p-3 shadow-lg flex-shrink-0">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-white mb-1">
                  {coreValues[1].title}
                </h3>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                  {coreValues[1].description}
                </p>
              </div>
            </div>

            {/* Excellence - Middle Left (icon RIGHT, text LEFT - same as People First) */}
            <div className="flex flex-row-reverse items-start gap-2 sm:gap-3 md:col-span-1 md:justify-start mt-29 ">
              <div className="bg-white rounded-lg p-2 sm:p-3 shadow-lg flex-shrink-0">
                <Star className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-white mb-1">
                  {coreValues[2].title}
                </h3>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                  {coreValues[2].description}
                </p>
              </div>
            </div>

            {/* Integrity - Middle Right (icon LEFT, text RIGHT - same as Accountability) */}
            <div className="flex flex-row items-start gap-2 sm:gap-3 md:col-span-1 md:justify-start md:col-start-3 mt-29 ">
              <div className="bg-white rounded-lg p-2 sm:p-3 shadow-lg flex-shrink-0">
                <Users2 className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-white mb-1">
                  {coreValues[3].title}
                </h3>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                  {coreValues[3].description}
                </p>
              </div>
            </div>

            {/* Innovation - Bottom Center (icon TOP, content BOTTOM) */}
            <div className="flex flex-col items-center gap-2 sm:gap-3 md:col-span-1 md:col-start-2 md:justify-end mt-8 sm:mt-10 md:mt-12 lg:mt-35">
              <div className="bg-white rounded-lg p-2 sm:p-3 shadow-lg">
                <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-indigo-600" />
              </div>
              <div className="text-center">
                <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-white mb-1">
                  {coreValues[4].title}
                </h3>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                  {coreValues[4].description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VitaCoreValues;
