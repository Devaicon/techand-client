import { UserRound, Trophy, Globe } from "lucide-react";
import FinancialCard from "./FinancialCard";
import PartnerSection from "./PartnerSection";

const FinancialBacking = () => {
  const financial = [
    {
      title: "20+ Years",
      description: "Proven industry experience",
      icon: UserRound,
    },
    {
      title: "Strong Client Base",
      description: "Delivered in multiple industries",
      icon: Trophy,
    },
    {
      title: "Global Partner",
      description: "Worldwide collaboration reach",
      icon: Globe,
    },
  ];

  return (
    <section className="min-h-[550px] sm:min-h-[600px] md:min-h-[650px] lg:min-h-[700px] xl:h-[700px] w-full bg-[#fffcfa] flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-10 md:py-12 lg:py-14 xl:py-16 gap-6 sm:gap-8 md:gap-10 lg:gap-12 relative overflow-hidden">
      {/* Content */}
      <div className="flex flex-col items-start sm:items-center text-left sm:text-center justify-start  sm:justify-center w-full sm:w-[95%] md:w-[90%] lg:w-[85%] xl:w-[75%] gap-0 mt-2 sm:mt-4 md:mt-6 lg:mt-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-[36px] xl:text-[38px] font-semibold leading-[1.3] lg:leading-[1.4] text-[rgba(55,70,158,1)] mb-3 sm:mb-4 md:mb-5 px-2 sm:px-4">
          Empowering enterprise transformation through cutting-edge technology
        </h1>

        <p className="text-xs sm:text-sm md:text-base lg:text-[15px] xl:text-[18px] leading-[1.6] sm:leading-[1.65] md:leading-[1.7] text-[rgba(136,136,136,1)] m-0 px-2 sm:px-4 max-w-full">
          Choosing the right partner is the most important step for your
          company&apos;s future technology goals. We bring together a massive
          team of experts and significant financial backing to ensure your
          project succeeds on time. Our work across many different GCC
          industries proves that we understand how to solve complex business
          problems with smart AI tools. You can trust our experts to deliver
          modern Microsoft solutions that keep your business running smoothly
          every single day.
        </p>
      </div>

      {/* Cards */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-8 items-stretch justify-center w-full sm:w-[95%] md:w-[90%] lg:w-[85%] xl:w-[75%] max-w-[1100px]">
        {financial.map((item, index) => (
          <FinancialCard key={index} {...item} />
        ))}
      </div>

      {/* Partners */}
      <div className="relative z-10 w-full flex justify-center">
        {/* <PartnerSection /> */}

        {/* Decorative Circles */}
        <div
          className="absolute bottom-[-200px] left-[150px] w-[300px] h-[250px] rounded-full bg-green-500 opacity-35 z-0"
          style={{ filter: "blur(170px)" }}
          aria-hidden="true"
        />
        <div
          className="absolute bottom-[-200px] right-[250px] w-[300px] h-[250px] rounded-full bg-red-500 opacity-35 z-0"
          style={{ filter: "blur(170px)" }}
          aria-hidden="true"
        />
      </div>
    </section>
  );
};

export default FinancialBacking;
