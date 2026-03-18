import Image from "next/image";

const PartnerSection = () => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-8 bg-white/95 px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 py-1.5 sm:py-2 md:py-2.5 lg:py-3 rounded-lg sm:rounded-xl md:rounded-2xl shadow-[0px_4px_16px_rgba(55,70,158,0.15)] w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] md:w-[90%] lg:w-[85%] xl:w-[75%] max-w-[56.25rem] mb-0">
      <span className="text-xs sm:text-base md:text-lg lg:text-xl xl:text-[1.375rem] font-bold italic whitespace-nowrap bg-gradient-to-b from-[#4555a7] to-[#53406b] bg-clip-text text-transparent">
        Technology Partners
      </span>

      <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-8 items-center">
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-2.5 lg:gap-3 bg-white rounded-md sm:rounded-lg px-1.5 sm:px-2 md:px-2.5 lg:px-3 py-1 sm:py-1.5 md:py-2 border border-gray-200 shadow-sm">
          <Image
            src="/microsoftlogo.svg"
            alt="Microsoft"
            width={80}
            height={80}
            className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 object-contain"
          />
          <div className="flex flex-col leading-none">
            <span className="text-[0.5625rem] sm:text-[0.625rem] md:text-xs lg:text-sm text-gray-700 font-semibold">
              Microsoft
            </span>
            <span className="text-[0.5625rem] sm:text-[0.625rem] md:text-xs lg:text-sm font-bold">
              Partner
            </span>
          </div>
        </div>
        <Image
          src="/salesforce.svg"
          alt="Salesforce Partner"
          width={220}
          height={220}
          className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-36 lg:h-36 xl:w-[11.25rem] object-contain"
        />
        <Image
          src="/openedx.svg"
          alt="Open edX Partner"
          width={200}
          height={200}
          className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 xl:w-[10rem] object-contain"
        />
      </div>
    </div>
  );
};

export default PartnerSection;
