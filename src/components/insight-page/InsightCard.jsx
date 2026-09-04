"use client";

import React from "react";
import Image from "next/image";
import { CATEGORIES } from "./insightUtils";
import {
  CategoryBadge,
  ReadTime,
  CardWrapper,
  ReadMoreButton,
} from "./InsightComponents";

const CategoryFilters = ({ activeCategory, onCategoryChange }) => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 w-full max-w-4xl bg-white py-3 rounded-lg">
      {CATEGORIES.map((category) => (
        <button
          key={category}
          onClick={() => onCategoryChange(category)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeCategory === category
              ? "bg-[#4A2D58] text-white"
              : "text-black hover:bg-gray-100"
          }`}
          aria-pressed={activeCategory === category}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

// The large hero card at the top of the list. It shows the single NEWEST post,
// whatever its `isFeatured` flag says — `isFeatured` selects posts for the
// separate "Featured blogs" rail in FeaturedInsights.jsx. Two different
// meanings of "featured", both kept because both match how the site reads.
const FeaturedCard = ({ post }) => {
  return (
    // Side-by-side only from `lg`. Between 768px and 1024px the text column is
    // barely 300px wide, so the title/description stack ends up far taller than
    // a 16:9 image of that column's width — the picture floated in the middle of
    // a tall card with dead space above and below it. Stacking through that band
    // gives the thumbnail the card's full width, and by `lg` the two columns are
    // close enough in height that nothing floats.
    <CardWrapper className="mb-8 w-full lg:flex lg:items-center">
      {/* Sized BY its 16:9 ratio, never stretched to whatever height the text
          beside it needs — stretching is what used to crop a widescreen image
          down its sides. 58% is picked so the image's height lands near the
          text column's at desktop widths, which is what keeps the leftover
          space small. */}
      <div className="relative aspect-video w-full shrink-0 lg:w-[58%]">
        <Image
          src={post.image}
          alt={post.title}
          fill
          sizes="(max-width: 1024px) 100vw, 58vw"
          className="object-cover"
          style={{ objectPosition: post.imageFocus || "center" }}
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-4">
          <CategoryBadge category={post.category} variant="primary" />
          <ReadTime label={post.readTime} />
        </div>
        <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 line-clamp-2">
          {post.title}
        </h3>
        <p className="text-gray-600 text-sm sm:text-base mb-5 line-clamp-3">
          {post.description}
        </p>
        <ReadMoreButton href={post.link} />
      </div>
    </CardWrapper>
  );
};

const BlogPostCard = ({ post }) => {
  return (
    <CardWrapper className="flex flex-col">
      {/* Sized by the 16:9 ratio, never a fixed pixel height: a fixed height
          means the box gets wider or narrower with the grid column while its
          height stands still, so the thumbnail's crop changes at every
          breakpoint. `aspect-video` keeps the same 16:9 window at 1, 2 or 3
          columns. */}
      <div className="relative aspect-video w-full shrink-0">
        <Image
          src={post.image}
          alt={post.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
          style={{ objectPosition: post.imageFocus || "center" }}
        />
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-3 mb-3">
          <CategoryBadge category={post.category} variant="secondary" />
          <ReadTime label={post.readTime} className="text-xs" />
        </div>
        <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-2 line-clamp-2">
          {post.title}
        </h4>
        <p className="text-gray-600 text-sm mb-4 flex-1 line-clamp-3">
          {post.description}
        </p>
        <ReadMoreButton href={post.link} />
      </div>
    </CardWrapper>
  );
};

const EmptyState = () => {
  return (
    <div className="text-center py-12">
      <p className="text-gray-600 text-lg mb-2">No articles found</p>
      <p className="text-gray-500 text-sm">
        Try adjusting your search or filter to find what you&apos;re looking
        for.
      </p>
    </div>
  );
};

const InsightCard = ({
  activeCategory,
  onCategoryChange,
  featuredPost,
  posts,
  showFeatured,
}) => {
  return (
    <>
      <CategoryFilters
        activeCategory={activeCategory}
        onCategoryChange={onCategoryChange}
      />

      {showFeatured && <FeaturedCard post={featuredPost} />}

      {posts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <BlogPostCard key={post.link} post={post} />
          ))}
        </div>
      ) : (
        // Only "nothing found" if the featured card is hidden too — otherwise
        // the page would show a post and deny having any.
        !showFeatured && <EmptyState />
      )}
    </>
  );
};

export default InsightCard;
