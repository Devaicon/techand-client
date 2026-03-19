import {
  Landmark,
  Building2,
  Home,
  MapPin,
  Package,
  ShoppingBag,
  Briefcase,
  Heart,
} from "lucide-react";
import Image from "next/image";
import IndustryCard from "./IndustryCard";

const industries = [
  {
    id: "bfsi",
    title: "Banking & Financial Services",
    description: "Secure compliant systems for regulated financial operations",
    icon: Landmark,
  },
  {
    id: "public-sector",
    title: "Public Sector",
    description: "Digital platforms for transparent and efficient governance",
    icon: Building2,
  },
  {
    id: "education",
    title: "Education & Training",
    description: "Streamlined education management and data driven insights",
    icon: Home,
  },
  {
    id: "hospitality",
    title: "Tourism & Hospitality",
    description: "Smart systems enhancing guest experience and operations",
    icon: MapPin,
  },
  {
    id: "manufacturing",
    title: "Trading & Manufacturing",
    description:
      "Connected supply chains are improving production and visibility",
    icon: Package,
  },
  {
    id: "retail",
    title: "Retail",
    description: "Unified commerce delivering better customer experiences",
    icon: ShoppingBag,
  },
  {
    id: "professional-services",
    title: "Professional Services",
    description: "Process driven systems for service focused firms",
    icon: Briefcase,
  },
  {
    id: "nonprofit",
    title: "Non Profit",
    description: "Technology enabling impact transparency and growth",
    icon: Heart,
  },
];

const IndustriesSection = () => {
  return (
    <section className="flex justify-center py-12 sm:py-16 md:py-20 lg:py-[100px] pb-10 sm:pb-12 md:pb-[60px] px-4 sm:px-6 md:px-8 bg-[#f4efec] relative overflow-hidden">
      {/* Decorative Orbs - Top Left */}
      <Image
        src="/orb-1.webp"
        alt=""
        width={750}
        height={750}
        className="absolute top-0 left-0 -translate-x-[30%] -translate-y-[24%] sm:-translate-x-[28%] sm:-translate-y-[22%] md:-translate-x-[26%] md:-translate-y-[20%] lg:-translate-x-[24%] lg:-translate-y-[18%] opacity-[0.8] pointer-events-none w-[250px] sm:w-[350px] md:w-[450px] lg:w-[550px] xl:w-[650px] 2xl:w-[750px] h-auto border-none"
        aria-hidden="true"
      />
      <Image
        src="/orb-2.webp"
        alt=""
        width={850}
        height={1850}
        className="absolute top-0 left-0 -translate-x-[18%] -translate-y-[10%] sm:-translate-x-[16%] sm:-translate-y-[8%] md:-translate-x-[14%] md:-translate-y-[6%] lg:-translate-x-[12%] lg:-translate-y-[4%] pointer-events-none w-[300px] sm:w-[400px] md:w-[550px] lg:w-[650px] xl:w-[750px] 2xl:w-[850px] h-auto"
        aria-hidden="true"
      />

      <div className="w-full max-w-[1180px] text-center relative z-10">
        <h2 className="text-3xl sm:text-4xl md:text-[48px] font-bold text-[#333333] mb-2">
          Industries We Serve
        </h2>
        <p className="text-base sm:text-lg md:text-[20px] font-normal text-[#475569] mb-6 sm:mb-8 md:mb-10 px-2">
          Fix core business challenges using secure enterprise technology that
          delivers measurable results.
        </p>

        <div className="flex flex-wrap gap-5 w-full justify-center">
          {industries.map((industry, index) => (
            <IndustryCard
              key={index}
              id={industry.id}
              title={industry.title}
              description={industry.description}
              Icon={industry.icon}
              className="
        flex-1
        min-w-full
        sm:min-w-[calc(50%-10px)]
        sm:max-w-[calc(50%-10px)]
        lg:min-w-[calc(33.333%-13.34px)]
        lg:max-w-[calc(33.333%-13.34px)]
      "
            />
          ))}
        </div>
      </div>

      {/* Vector decoration under Healthcare card */}
      <Image
        src="/and.png"
        alt=""
        width={200}
        height={700}
        className="absolute bottom-0 right-0 -translate-x-3 sm:-translate-x-4 md:-translate-x-5 lg:-translate-x-6 2xl:-translate-x-8 [@media(min-width:2560px)]:right-0 [@media(min-width:2560px)]:-translate-x-8 pointer-events-none z-0 w-[150px] sm:w-[200px] md:w-[250px] lg:w-[300px] 2xl:w-[450px] h-auto"
        aria-hidden="true"
      />
    </section>
  );
};

export default IndustriesSection;
