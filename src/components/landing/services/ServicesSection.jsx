import ServiceCard from "./ServiceCard";
import Image from "next/image";
const services = [
  {
    tag: "Tech& Consulting",
    title: "Assess & Envision",
    description:
      "We analyze your current business challenges and develop a comprehensive plan to achieve your future technology objectives.",
  },
  {
    tag: "Tech& Consulting",
    title: "Build & Implement",
    description:
      "Our team develops your custom software and installs the right Microsoft tools to make your work easier.",
  },
  {
    tag: "Tech& Consulting",
    title: "Run & Optimize",
    description:
      "We keep your systems moving quickly and continually find new ways to enhance the performance of your digital tools.",
  },
  {
    tag: "Tech& Consulting",
    title: "Global Rollouts",
    description:
      "We take your business solutions and launch them safely across different countries and many new office locations.",
  },
  {
    tag: "Tech& Consulting",
    title: "Managed Services",
    description:
      "Our experts handle your daily IT needs, allowing your staff to focus on major projects without technical stress.",
  },
  {
    tag: "Tech& Consulting",
    title: "AI & Automation",
    description:
      "Deliver measurable outcomes using AI agents, intelligent automation, and data-driven insights across enterprise workflows...",
  },
];

const ServicesSection = () => {
  return (
    <section className="bg-[#f4efec] relative overflow-hidden py-0 sm:py-0">
      <div className="w-full max-w-[1180px] mx-auto text-center px-4 sm:px-6 md:px-8 relative z-10">
        <h2 className="text-3xl sm:text-4xl md:text-[48px] font-bold text-[#333333] mb-2">
          What We Do
        </h2>
        <p className="text-base sm:text-lg md:text-[20px] font-normal text-[#475569] mb-6 sm:mb-8 md:mb-10 px-2">
          We guide your business through every step of technology growth to
          ensure you stay ahead of competitors.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 pb-12 sm:pb-16 md:pb-20 lg:pb-[100px]">
          {services.map((service, index) => (
            <ServiceCard key={index} {...service} />
          ))}
        </div>
      </div>
      {/* Vector decoration under cards */}
      {/* <Image
        src="/vector-2.webp"
        alt=""
        width={400}
        height={400}
        className="absolute bottom-0 left-[5px] pointer-events-none z-0 w-[150px] sm:w-[200px] md:w-[250px] lg:w-[300px] xl:w-[350px] 2xl:w-[450px] h-auto"
        aria-hidden="true"
      /> */}
    </section>
  );
};

export default ServicesSection;
