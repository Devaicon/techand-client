import Image from "next/image";
import Link from "next/link";

const CapabilitiesCards = ({
  image,
  title,
  description,
  categoryUrl,
  slug,
}) => {
  // Build the full URL path
  const cardUrl =
    categoryUrl && slug ? `/${categoryUrl}#${slug}` : "/capabilities";

  return (
    <article className="flex flex-col bg-white rounded-xl shadow-sm h-auto min-h-[280px] md:min-h-[300px] w-full p-4 md:p-5">
      <div className="flex flex-col gap-2 md:gap-2.5 h-full pt-0.5">
        <div className="flex items-center justify-center h-12 w-12 md:h-14 md:w-14 rounded-lg border border-gray-100">
          <Image
            src={image}
            alt={title}
            width={32}
            height={32}
            className="w-6 h-6 md:w-7 md:h-7"
          />
        </div>
        <h3 className="text-[15px] md:text-[16px] font-semibold text-[#0E1726] leading-[1.3]">
          {title}
        </h3>
        <p className="text-[12px] md:text-[13px] text-[#666666] leading-[1.5] flex-grow">
          {description}
        </p>
        <Link
          href={cardUrl}
          className="relative self-start font-semibold text-[12px] md:text-[13px] mt-1 transition-all duration-500 group inline-flex items-center gap-1 hover:gap-2"
          aria-label={`Learn more about ${title}`}
        >
          <span className="relative bg-gradient-to-b from-[#4555A7] to-[#53406B] bg-clip-text text-transparent group-hover:from-[#5266bf] group-hover:to-[#654e7f] transition-all duration-500 whitespace-nowrap">
            Learn more
            <span className="absolute left-0 bottom-0 w-full h-[1px] bg-gradient-to-b from-[#4555A7] to-[#53406B] group-hover:h-[2px] group-hover:from-[#5266bf] group-hover:to-[#654e7f] transition-all duration-300"></span>
          </span>
          <svg
            viewBox="0 0 24 24"
            className="w-3 h-3 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-hover:delay-200"
          >
            <defs>
              <linearGradient
                id="arrowGradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  style={{ stopColor: "#4555A7", stopOpacity: 1 }}
                />
                <stop
                  offset="100%"
                  style={{ stopColor: "#53406B", stopOpacity: 1 }}
                />
              </linearGradient>
              <linearGradient
                id="arrowGradientHover"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  style={{ stopColor: "#5266bf", stopOpacity: 1 }}
                />
                <stop
                  offset="100%"
                  style={{ stopColor: "#654e7f", stopOpacity: 1 }}
                />
              </linearGradient>
            </defs>
            <path
              d="M13.025 1l-2.847 2.828 6.176 6.176h-16.354v3.992h16.354l-6.176 6.176 2.847 2.828 10.975-11z"
              fill="url(#arrowGradient)"
              className="group-hover:fill-[url(#arrowGradientHover)]"
            />
          </svg>
        </Link>
      </div>
    </article>
  );
};

export default CapabilitiesCards;
