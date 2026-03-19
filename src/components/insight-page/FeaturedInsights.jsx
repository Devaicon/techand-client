import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const FEATURED_BLOG_POSTS = [
  {
    image: "/blog-insight-img1.webp",
    category: "Cloud",
    title: "Building Scalable Cloud Foundations for Growth",
    description:
      "Discover best practices for designing secure, scalable cloud architectures that support enterprise workloads.",
    slug: "powering-enterprise-transformation-ai",
    comingSoon: true,
  },
  {
    image: "/blog-insight-img1.webp",
    category: "Cloud",
    title: "Building Scalable Cloud Foundations for Growth",
    description:
      "Discover best practices for designing secure, scalable cloud architectures that support enterprise workloads.",
    slug: "powering-enterprise-transformation-ai",
    comingSoon: true,
  },
  {
    image: "/blog-insight-img1.webp",
    category: "Cloud",
    title: "Building Scalable Cloud Foundations for Growth",
    description:
      "Discover best practices for designing secure, scalable cloud architectures that support enterprise workloads.",
    slug: "powering-enterprise-transformation-ai",
    comingSoon: true,
  },
];

const FeaturedBlogCard = ({ post }) => {
  return (
    <div className=" flex flex-col sm:flex-row items-stretch pb-3">
      {/* Image Section */}
      <div className="relative w-full sm:w-[45%] h-[200px] sm:h-auto min-h-[180px] shrink-0">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover"
        />
        {post.comingSoon && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <span className="text-[#5b6fb6] text-xs sm:text-sm font-semibold px-6 py-2 bg-white rounded-full uppercase">
              Coming Soon
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5 sm:p-6 flex flex-col justify-center flex-1">
        <div className="flex items-center gap-3 mb-3">
          <span className="inline-block px-3 py-1 bg-[#4A2D58] text-white text-xs font-semibold rounded">
            {post.category}
          </span>

          <span className="text-xs text-gray-200">5 min read</span>
        </div>

        <h3 className="text-lg sm:text-xl font-semiBold  text-white mb-3 leading-snug">
          {post.title}
        </h3>

        <p className="text-gray-200 text-sm mb-4 leading-relaxed">
          {post.description}
        </p>

        {post.comingSoon ? (
          <button
            disabled
            className="px-4 py-2 bg-gray-400 text-gray-600 rounded text-sm font-semibold cursor-not-allowed self-start inline-flex items-center gap-1 opacity-60"
          >
            Read more <ArrowRight size={16} />
          </button>
        ) : (
          <Link
            href={`/insights/${post.slug}`}
            className="px-4 py-2 bg-white text-[#5e5796] rounded text-sm font-semibold hover:bg-gray-100 transition-all self-start inline-flex items-center gap-1"
          >
            Read more <ArrowRight size={16} />
          </Link>
        )}
      </div>
    </div>
  );
};

const FeaturedInsights = () => {
  return (
    <section
      style={{ background: "#FEF9F3" }}
      className="py-1 sm:py-1 md:py-1 flex justify-center px-4 "
    >
      <div
        className="w-full max-w-[1200px] lg:w-[70%] rounded-2xl mb-14"
        style={{
          background: "linear-gradient(180deg, #4555A7 0%, #53406B 100%)",
        }}
      >
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 p-6 sm:p-8 md:p-10 lg:p-12">
          {/* Left Section - Featured Blog Info */}
          <div className="w-full lg:w-[35%] flex flex-col justify-between">
            {/* Top Content */}
            <div>
              <div className="flex items-center gap-3 mb-4 ">
                <span className="text-white text-sm bg-[#37469E]">
                  Trending: <span className="font-semibold ">Growth</span>
                </span>
                <span className="text-gray-300 text-sm">5 min read</span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-Bold text-white mb-5 leading-tight">
                Featured blogs
              </h2>

              <p className="text-gray-200 text-sm sm:text-base leading-relaxed mb-6">
                Discover how Tech& helps organizations apply AI, automation, and
                intelligent platforms to improve efficiency, decision-making,
                and scalability. Learn how enterprises are moving from
                experimentation to real, measurable outcomes.
              </p>

              <button className="px-5 py-2.5 border-2 border-white text-white rounded text-sm font-normal hover:bg-white hover:text-[#4555A7] transition-all inline-flex items-center gap-2">
                Read more <ArrowRight size={16} />
              </button>
            </div>

            {/* Logo Section */}
            <div className="mt-8 lg:mt-12">
              <div className=" p-8 flex items-center justify-center ">
                <div className="relative w-[600px] h-[400px]">
                  <Image
                    src="/footer-logo1.png"
                    alt="Tech& Logo"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Blog Cards */}
          <div className="w-full lg:w-[65%] flex flex-col gap-6">
            {FEATURED_BLOG_POSTS.map((post, index) => (
              <FeaturedBlogCard key={index} post={post} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedInsights;
