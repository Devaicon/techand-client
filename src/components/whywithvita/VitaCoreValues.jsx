import React from "react";
import { Users, TrendingUp, Star, Lightbulb } from "lucide-react";

export default function CornerListComponent() {
  // JSON Data
  const data = {
    centerSquare: {
      header: "CORE VALUES",
      helperText: "Our values shape how we work, partner, and deliver impact.",
    },
    items: [
      {
        id: 1,
        position: "top-left",
        header: "People First",
        description:
          "We put people at the core of everything we do. We listen, support, and empower our teams to drive collaboration and shared success.",
        icon: Users,
      },
      {
        id: 2,
        position: "top-right",
        header: "Accountability",
        description:
          "We take ownership of results. We deliver quality work with integrity, taking responsibility for outcomes in all we do.",
        icon: TrendingUp,
      },
      {
        id: 3,
        position: "left",
        header: "Excellence",
        description:
          "We aim for continuous improvement and are committed to raising the bar on quality across all our operations.",
        icon: Star,
      },
      {
        id: 4,
        position: "right",
        header: "Integrity",
        description:
          "We act with honesty and transparency in all our interactions, building trust through consistent, principled behavior.",
        icon: Users,
      },
      {
        id: 5,
        position: "bottom",
        header: "Innovation",
        description:
          "We embrace change and challenge the status quo. We test new ideas, learn from failures, and drive continuous improvement with confidence.",
        icon: Lightbulb,
      },
    ],
  };

  return (
    <div
      className="min-h-screen p-4 sm:p-8 flex items-center justify-center max-w-7xl mx-auto rounded-2xl sm:rounded-3xl lg:rounded-[30px] mt-16"
      style={{
        background: "linear-gradient(180deg, #4555A7 0%, #53406B 100%)",
      }}
    >
      {/* Mobile List View */}
      <div className="lg:hidden w-full py-8">
        {/* Center Header */}
        <div className="bg-[#37469E] rounded-2xl p-6 mb-8 shadow-lg text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            {data.centerSquare.header}
          </h2>
          <p className="text-white text-sm font-light">
            {data.centerSquare.helperText}
          </p>
        </div>

        {/* Values List */}
        <div className="space-y-4">
          {data.items.map((item) => (
            <div
              key={item.id}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-start gap-4 hover:bg-white/20 transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-xl flex items-center justify-center shadow-md flex-shrink-0 bg-white">
                {React.createElement(item.icon, {
                  className: "w-8 h-8",
                  color: "#2196F3",
                })}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">
                  {item.header}
                </h3>
                <p className="text-sm text-white/90 font-light">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Circular View */}
      <div className="hidden lg:block relative w-full max-w-5xl h-96">
        {/* Diagonal Dashed Lines (behind the circle) */}
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[21.5rem] h-[21.5rem]">
          {/* Line from top-left to bottom-right */}
          <div className="absolute top-0 left-0 w-full h-full">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <line
                x1="0"
                y1="0"
                x2="100"
                y2="100"
                stroke="#1e293b"
                strokeWidth="0.5"
                strokeDasharray="0,0"
              />
            </svg>
          </div>
          {/* Line from top-right to bottom-left */}
          <div className="absolute top-0 left-0 w-full h-full">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <line
                x1="100"
                y1="0"
                x2="0"
                y2="100"
                stroke="#1e293b"
                strokeWidth="0.5"
                strokeDasharray="0,0"
              />
            </svg>
          </div>
        </div>
        {/* Bigger Dashed Border Circle */}
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[21.5rem] h-[21.5rem] border-2 border-dashed rounded-full opacity-50"></div>

        {/* Vertical Line Below Circle */}
        <div
          className="absolute top-1/4 left-1/2 transform -translate-x-1/2 w-0.5 h-32 bg-[#1e293b]"
          style={{ top: "calc(25% + 144px)" }}
        ></div>

        {/* Center Circle */}
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[#37469E] rounded-full flex flex-col items-center justify-center p-6 shadow-[0_0_30px_rgba(255,255,255,0.4)]">
          <h2 className="text-xl font-bold text-white mb-2">
            {data.centerSquare.header}
          </h2>
          <p className="text-white text-center text-sm font-light">
            {data.centerSquare.helperText}
          </p>
        </div>

        {/* Top Left Item */}
        <div className="absolute top-[-120px] left-[-40px] flex items-start gap-3 max-w-sm">
          <div className="text-right flex-1">
            <h3 className="text-lg font-semibold text-white">
              {data.items[0].header}
            </h3>
            <p className="text-sm text-white font-light mt-1">
              {data.items[0].description}
            </p>
          </div>
          <div className="w-20 h-20 rounded-xl flex items-center justify-center shadow-md flex-shrink-0 bg-white">
            {React.createElement(data.items[0].icon, {
              className: "w-10 h-10",
              color: "#2196F3",
            })}
          </div>
        </div>

        {/* Top Right Item */}
        <div className="absolute top-[-120px] right-[-40px] flex items-start gap-3 max-w-sm">
          <div className="w-20 h-20 rounded-xl flex items-center justify-center shadow-md flex-shrink-0 bg-white">
            {React.createElement(data.items[1].icon, {
              className: "w-10 h-10",
              color: "#2196F3",
            })}
          </div>
          <div className="text-left flex-1">
            <h3 className="text-lg font-semibold text-white">
              {data.items[1].header}
            </h3>
            <p className="text-sm text-white font-light mt-1">
              {data.items[1].description}
            </p>
          </div>
        </div>

        {/* Left Item */}
        <div className="absolute bottom-[-20px] left-[-40px] transform -translate-y-1/2 flex items-start gap-3 max-w-sm">
          <div className="text-right flex-1">
            <h3 className="text-lg font-semibold text-white">
              {data.items[2].header}
            </h3>
            <p className="text-sm text-white font-light mt-1">
              {data.items[2].description}
            </p>
          </div>
          <div className="w-20 h-20 rounded-xl flex items-center justify-center shadow-md flex-shrink-0 bg-white">
            {React.createElement(data.items[2].icon, {
              className: "w-10 h-10",
              color: "#4A2D58",
            })}
          </div>
        </div>

        {/* Right Item */}
        <div className="absolute bottom-[-20px] right-[-40px] transform -translate-y-1/2 flex items-start gap-3 max-w-sm">
          <div className="w-20 h-20 rounded-xl flex items-center justify-center shadow-md flex-shrink-0 bg-white">
            {React.createElement(data.items[3].icon, {
              className: "w-10 h-10",
              color: "#4A2D58",
            })}
          </div>
          <div className="text-left flex-1">
            <h3 className="text-lg font-semibold text-white">
              {data.items[3].header}
            </h3>
            <p className="text-sm text-white font-light mt-1">
              {data.items[3].description}
            </p>
          </div>
        </div>

        {/* 5th Item - Bottom */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-32 flex flex-col items-center gap-2 w-64">
          <div className="w-20 h-20 rounded-xl flex items-center justify-center shadow-md flex-shrink-0 bg-white">
            {React.createElement(data.items[4].icon, {
              className: "w-10 h-10",
              color: "#4A2D58",
            })}
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white">
              {data.items[4].header}
            </h3>
            <p className="text-sm text-white font-light mt-1">
              {data.items[4].description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
