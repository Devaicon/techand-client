import Link from "next/link";

const IndustryCard = ({ id, title, description, Icon, className = "" }) => {
  return (
    <Link
      href={`/industries#${id}`}
      className={`bg-white flex flex-col sm:flex-row gap-4 p-6 rounded-[12px] shadow-md text-left hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-gray-200 ${className}`}
    >
      <div className="w-10 h-10 rounded-lg bg-[#4655a51a] flex items-center justify-center flex-shrink-0">
        <Icon className="text-[#37469e] w-5 h-5" aria-hidden="true" />
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-[20px] font-normal text-[#0a0a0a]">{title}</h3>
        <p className="text-[16px] text-[#4a5565] leading-6">{description}</p>
      </div>
    </Link>
  );
};

export default IndustryCard;
