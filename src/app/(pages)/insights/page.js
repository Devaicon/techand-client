import InsightHero from "@/components/insight-page/InsightHero";
import BlogInsights from "@/components/insight-page/BlogInsights";
import FeaturedInsights from "@/components/insight-page/FeaturedInsights";

const page = () => {
  return (
    <main>
      <InsightHero />
      <BlogInsights />
      <FeaturedInsights />
    </main>
  );
};

export default page;
