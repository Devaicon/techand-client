import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getInsightBySlug } from "@/lib/insights-content";

// Get blog post from content files
const getBlogPost = (slug) => {
  const post = getInsightBySlug(slug);

  // Return the post or null if not found
  return post;
};

// Generate static params for all insights
export function generateStaticParams() {
  return [
    { slug: "agentic-ai" },
    { slug: "data-sovereign-asset" },
    { slug: "autonomous-ai-customer-service" },
  ];
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  // Handle 404 if post not found
  if (!post) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            404 - Insight Not Found
          </h1>
          <p className="text-gray-600 mb-8">
            The insight you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            href="/insights"
            className="px-6 py-3 text-white font-semibold rounded-lg"
            style={{ background: "#37469E" }}
          >
            Back to Insights
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section
        className="relative w-full py-20 md:py-28 lg:py-32 overflow-hidden flex justify-center"
        style={{
          background: "linear-gradient(135deg, #4555A7 0%, #7C5BA8 100%)",
        }}
      >
        <div className="w-full lg:w-[calc(100%-280px)] max-w-[1639px] px-4 sm:px-8 lg:px-6 xl:px-[59px]">
          {/* Back Link */}
          <Link
            href="/insights"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Insights</span>
          </Link>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            {post.title}
          </h1>
          <p className="text-lg sm:text-xl text-white/90 max-w-4xl leading-relaxed">
            {post.subtitle}
          </p>
        </div>
      </section>

      {/* Article Content */}
      <article className="max-w-5xl mx-auto px-6 sm:px-12 md:px-16 py-12 md:py-16">
        {/* Article Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-block px-3 py-1 bg-gradient-to-r from-[#4555A7] to-[#7C5BA8] text-white text-xs font-semibold rounded">
              {post.category}
            </span>
            <span className="text-sm text-gray-500">{post.date}</span>
          </div>
        </header>

        {/* Hero Image */}
        <div className="relative w-full h-64 md:h-96 mb-12 rounded-lg overflow-hidden shadow-lg">
          <Image
            src={post.heroImage}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Article Body */}
        <div className="prose prose-lg max-w-none">
          {/* Top Section */}
          {post.content.topSection && (
            <section className="mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {post.content.topSection.title}
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                {post.content.topSection.subtitle}
              </p>
            </section>
          )}

          {/* Introduction Section */}
          {post.content.introduction && (
            <section className="mb-12">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                {post.content.introduction.title}
              </h3>

              {post.content.introduction.paragraphs.map((para, idx) => (
                <p
                  key={idx}
                  className="text-gray-700 leading-relaxed mb-6 text-lg"
                >
                  {para}
                </p>
              ))}

              {/* Introduction Image */}
              {post.content.introduction.image && (
                <div className="my-10">
                  <div className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden mb-3 shadow-md">
                    <Image
                      src={post.content.introduction.image}
                      alt="Introduction visual"
                      fill
                      className="object-cover"
                    />
                  </div>
                  {post.content.introduction.imageCaption && (
                    <p className="text-sm text-gray-500 italic text-center">
                      {post.content.introduction.imageCaption}
                    </p>
                  )}
                </div>
              )}
            </section>
          )}

          {/* Quote Block */}
          {post.content.quote && (
            <blockquote
              className="my-12 pl-8 border-l-4 bg-gradient-to-br from-purple-50 to-blue-50 py-8 pr-8 rounded-r-lg shadow-sm"
              style={{ borderLeftColor: "#4555A7" }}
            >
              <p className="text-xl md:text-2xl font-medium text-gray-800 italic mb-3 leading-relaxed">
                &ldquo;{post.content.quote.text}&rdquo;
              </p>
              <footer className="text-sm text-gray-600 font-semibold">
                — {post.content.quote.author}
              </footer>
            </blockquote>
          )}

          {/* Body Content Sections */}
          {post.content.body.map((section, idx) => {
            const isVitaSection =
              section.title ===
                "How Does Tech& Enable Enterprise-Scale Agentic AI?" ||
              section.title ===
                "How Does Tech& Enable AI-Powered Voice Assistants?" ||
              section.title ===
                "How Tech& Enables Value with Microsoft Fabric?" ||
              section.title ===
                "How Does Tech& Contribute to and Guarantee ROI-Driven Transformation?";

            return (
              <section
                key={idx}
                className={`mb-12 ${
                  isVitaSection
                    ? "bg-gray-200 shadow-lg p-8 md:p-12 rounded-lg border border-gray-300 hover:shadow-xl duration-300 transition-all"
                    : ""
                }`}
              >
                <h3
                  className={`text-2xl md:text-3xl font-bold mb-6 ${
                    isVitaSection ? "text-gray-800" : "text-gray-900"
                  }`}
                >
                  {section.title}
                </h3>
                <p
                  className={`leading-relaxed mb-6 text-lg ${
                    isVitaSection ? "text-gray-600" : "text-gray-700"
                  }`}
                >
                  {section.content}
                </p>

                {section.subtitle && (
                  <p
                    className={`font-semibold mb-4 text-lg ${
                      isVitaSection ? "text-gray-600" : "text-gray-800"
                    }`}
                  >
                    {section.subtitle}
                  </p>
                )}

                {section.listItems && (
                  <ul
                    className={`list-disc list-inside space-y-3 ml-4 mb-6 ${
                      isVitaSection ? "text-gray-600" : "text-gray-700"
                    }`}
                  >
                    {section.listItems.map((item, itemIdx) => (
                      <li key={itemIdx} className="text-lg leading-relaxed">
                        {item}
                      </li>
                    ))}
                  </ul>
                )}

                {section.additionalText && (
                  <p
                    className={`leading-relaxed mb-4 text-lg mt-4 ${
                      isVitaSection ? "text-gray-600" : "text-gray-700"
                    }`}
                  >
                    {section.additionalText}
                  </p>
                )}
              </section>
            );
          })}

          {/* Body Image */}
          {post.content.bodyImage && (
            <div className="my-10">
              <div className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden mb-3 shadow-md">
                <Image
                  src={post.content.bodyImage}
                  alt="Article visual"
                  fill
                  className="object-cover"
                />
              </div>
              {post.content.bodyImageCaption && (
                <p className="text-sm text-gray-500 italic text-center">
                  {post.content.bodyImageCaption}
                </p>
              )}
            </div>
          )}

          {/* Conclusion */}
          {post.content.conclusion && (
            <section className="mb-12">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                {post.content.conclusion.title}
              </h3>

              {post.content.conclusion.paragraphs.map((para, idx) => (
                <p
                  key={idx}
                  className="text-gray-700 leading-relaxed mb-6 text-lg"
                >
                  {para}
                </p>
              ))}

              {/* CTA Section */}
              {post.content.conclusion.cta && (
                <div className="mt-10 p-8 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border-2 border-[#4555A7]/20 shadow-sm">
                  <h4 className="text-2xl font-bold text-gray-900 mb-4">
                    {post.content.conclusion.cta.title}
                  </h4>
                  <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                    {post.content.conclusion.cta.description}
                  </p>
                  <Link
                    href="/contact-us"
                    className="px-6 py-3 hover:shadow-lg text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105"
                    style={{ background: "#37469E" }}
                  >
                    Book a Session
                  </Link>
                </div>
              )}
            </section>
          )}
        </div>

        {/* Author Section */}
        <div className="mt-12 pt-8 border-t border-gray-200 flex items-center justify-between flex-wrap gap-6">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden">
              <Image
                src={post.author.avatar}
                alt={post.author.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900">
                {post.author.name}
              </h4>
              <p className="text-sm text-gray-600">{post.author.role}</p>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-4 py-2 text-white text-xs font-semibold rounded-full shadow-sm"
                style={{ background: "#4A2D58" }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </article>

      {/* Related Articles Section - Commented Out
      <section className="bg-gray-50 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 md:px-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Related Articles
            </h2>
            <Link
              href="/insights"
              className="px-6 py-3 hover:shadow-lg text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105"
              style={{ background: "#37469E" }}
            >
              View all posts
            </Link>
          </div>

          <p className="text-gray-600 mb-10 text-lg">
            Explore more insights on enterprise transformation and AI innovation
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {post.relatedArticles.map((article) => (
              <article
                key={article.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <div className="relative h-48 w-full">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className="inline-block px-3 py-1 text-white text-xs font-semibold rounded"
                      style={{ background: "#4A2D58" }}
                    >
                      {article.category}
                    </span>
                    <span className="text-sm text-gray-500">
                      {article.readTime}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-[#4555A7] transition-colors">
                    {article.title}
                  </h3>

                  <p
                    className="text-sm mb-4 line-clamp-3 leading-relaxed font-semibold"
                    style={{
                      background:
                        "linear-gradient(180deg, #4555A7 0%, #53406B 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {article.description}
                  </p>

                  <Link
                    href={`/insights/${article.slug}`}
                    className="inline-block px-5 py-2 hover:shadow-md text-white text-sm font-semibold rounded-sm transition-all duration-300"
                    style={{ background: "#37469E" }}
                  >
                    Read More
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      */}
    </main>
  );
}
