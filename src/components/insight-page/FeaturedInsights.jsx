import Image from "next/image";
import MicrosoftPartnerBadge from "@/components/shared/MicrosoftPartnerBadge";
import { CategoryBadge, ReadTime, ReadMoreButton } from "./InsightComponents";

// Describe the section, not any one post. Deliberately styled UNLIKE the solid
// CategoryBadge used on real posts, so section chrome is not mistaken for a
// post category.
const SECTION_PILLS = ["Insights", "Tech& Editorial"];

const FeaturedBlogCard = ({ post }) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch pb-3">
      {/* Image Section */}
      <div className="relative w-full sm:w-[45%] h-[200px] sm:h-auto min-h-[180px] shrink-0">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover"
          style={{ objectPosition: post.imageFocus || "center" }}
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
          <CategoryBadge category={post.category} variant="secondary" />
          <ReadTime label={post.readTime} onDark />
        </div>

        <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 leading-snug">
          {post.title}
        </h3>

        <p className="text-gray-200 text-sm mb-4 leading-relaxed line-clamp-3">
          {post.description}
        </p>

        <ReadMoreButton href={post.link} onDark disabled={post.comingSoon} />
      </div>
    </div>
  );
};

// Posts come from the Server Component above — the ones an editor flagged
// "Featured" in the admin panel.
const FeaturedInsights = ({ posts = [] }) => {
  // Nothing flagged isFeatured — render nothing rather than a section with an
  // empty right-hand column.
  if (posts.length === 0) return null;

  return (
    <section
      style={{ background: "#FEF9F3" }}
      className="py-1 sm:py-1 md:py-1 flex justify-center px-4"
    >
      <div
        className="w-full max-w-[1200px] lg:w-[70%] rounded-2xl mb-36"
        style={{
          background: "linear-gradient(180deg, #4555A7 0%, #53406B 100%)",
        }}
      >
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 p-6 sm:p-8 md:p-10 lg:p-12">
          {/* Left Section - Section blurb, with the logo lockup pinned below */}
          <div className="w-full lg:w-[35%] flex flex-col">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {SECTION_PILLS.map((pill) => (
                  <span
                    key={pill}
                    className="inline-block px-3 py-1 rounded-full bg-white/10 border border-white/25 text-white text-xs font-medium"
                  >
                    {pill}
                  </span>
                ))}
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
                Featured blogs
              </h2>

              <p className="text-gray-200 text-sm sm:text-base leading-relaxed">
                Discover how Tech& helps organizations apply AI, automation, and
                intelligent platforms to improve efficiency, decision-making,
                and scalability. Learn how enterprises are moving from
                experimentation to real, measurable outcomes.
              </p>
            </div>

            {/* Logo lockup, pinned to the bottom of the card: Tech& above,
                Microsoft Partner below. Deliberately has no panel of its own —
                the two marks read as a lockup on the card's gradient rather
                than as a boxed-off badge. Both are white assets
                (/footer_logo.svg is fill="white"), which is safe here only
                because that gradient is dark. */}
            <div className="mt-8 lg:mt-auto lg:pt-12">
              <div className="flex flex-col">
                <div className="relative w-[245px] h-[200px]">
                  <Image
                    src="/footer_logo.svg"
                    alt="Tech& Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <MicrosoftPartnerBadge size="lg" plaque className="bg-black" />
              </div>
            </div>
          </div>

          {/* Right Section - Blog Cards */}
          <div className="w-full lg:w-[65%] flex flex-col gap-6">
            {posts.map((post) => (
              <FeaturedBlogCard key={post.link} post={post} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedInsights;
