import React from "react";

const FinancialCard = ({ title, description, icon: Icon }) => {
  return (
    <div className="flex flex-row items-center gap-2.5 sm:gap-3 md:gap-3.5 lg:gap-4 text-left flex-1 min-w-0 w-full sm:w-auto px-3 sm:px-4 md:px-4 lg:px-6 py-3 sm:py-4 md:py-4 lg:py-5 rounded-lg sm:rounded-xl bg-white/80 shadow-[0px_4px_16px_rgba(69,85,167,0.08)] hover:shadow-[0px_6px_20px_rgba(69,85,167,0.12)] transition-shadow">
      <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-lg bg-gradient-to-br from-[#2c3e75] to-[#6b4d9e] shrink-0">
        <Icon
          className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 lg:w-6 lg:h-6 text-white"
          aria-hidden="true"
        />
      </div>

      <div className="flex flex-col gap-0.5 sm:gap-1 min-w-0">
        <h2 className="text-base sm:text-lg md:text-lg lg:text-[22px] xl:text-[25px] font-bold text-[#4555a7] m-0 mb-0 leading-tight">
          {title}
        </h2>
        <p className="text-[11px] sm:text-xs md:text-xs lg:text-[13px] text-[#4a2d58] m-0 leading-tight">
          {description}
        </p>
      </div>
    </div>
  );
};

export default FinancialCard;
