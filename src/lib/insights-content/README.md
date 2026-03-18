# Insights Content Management

This directory contains all the content for the insights/blog articles displayed on the website.

## Structure

```
lib/
└── insights-content/
    ├── index.js          # Main export file - add new insights here
    ├── agentic-ai.js     # Slider 1: Agentic AI content
    ├── data-asset.js     # Slider 3: Data Sovereign Asset content
    └── README.md         # This file
```

## How to Add a New Insight Article

### Step 1: Create a New Content File

Create a new file in `lib/insights-content/` with a descriptive name (e.g., `dynamics-365.js`):

```javascript
// Slider X: Your Title
export default {
  slug: "your-url-slug", // Must be unique
  category: "AI & Automation", // or "Data & Analytics", "Transformation", etc.
  date: "7 min read",
  title: "Your Article Title",
  subtitle: "Your article subtitle/summary",
  heroImage: "/your-hero-image.png",
  author: {
    name: "Tech& Technology Team",
    role: "Enterprise Specialists",
    avatar: "/evolution_of_ai.png",
  },
  tags: ["Tag1", "Tag2", "Tag3"],
  content: {
    topSection: {
      title: "Top section heading",
      subtitle: "Top section description",
    },
    introduction: {
      title: "Introduction Heading",
      paragraphs: ["First paragraph text...", "Second paragraph text..."],
      image: "/intro-image.png", // Optional
      imageCaption: "Image caption", // Optional
    },
    quote: {
      // Optional
      text: "Your inspirational quote",
      author: "Author Name",
    },
    body: [
      {
        title: "Section Title",
        content: "Section content paragraph...",
        subtitle: "Optional subtitle", // Optional
        listItems: [
          // Optional
          "First bullet point",
          "Second bullet point",
        ],
        additionalText: "Optional additional text after list", // Optional
      },
      // Add more sections as needed
    ],
    bodyImage: "/body-image.png", // Optional
    bodyImageCaption: "Body image caption", // Optional
    conclusion: {
      title: "Conclusion Heading",
      paragraphs: ["Conclusion paragraph 1...", "Conclusion paragraph 2..."],
      cta: {
        // Optional Call-to-Action
        title: "CTA Heading",
        description: "CTA description text",
      },
    },
  },
  relatedArticles: [
    {
      id: 1,
      category: "Category",
      title: "Related Article Title",
      description: "Article description...",
      image: "/article-image.png",
      readTime: "5 min read",
      slug: "related-article-slug",
    },
    // Add 2-3 related articles
  ],
};
```

### Step 2: Register the New Insight in index.js

Open `lib/insights-content/index.js` and add your new content:

```javascript
// Import your new file
import agenticAI from "./agentic-ai";
import dataAsset from "./data-asset";
import yourNewInsight from "./your-new-file"; // Add this

export const insightsContent = {
  "agentic-ai": agenticAI,
  "data-sovereign-asset": dataAsset,
  "your-url-slug": yourNewInsight, // Add this (use the same slug from your content file)
};

export const getInsightBySlug = (slug) => {
  return insightsContent[slug] || null;
};
```

### Step 3: Access Your New Insight

Your insight will automatically be available at:

```
https://yoursite.com/insights/your-url-slug
```

## Benefits of This Structure

✅ **Clean Separation**: Content is separated from presentation logic
✅ **Easy Maintenance**: Each insight is in its own file
✅ **Scalable**: Add unlimited insights without cluttering page.js
✅ **Type Safety**: Consistent structure across all insights
✅ **Reusability**: Content can be imported anywhere in the app
✅ **Version Control**: Easy to track changes to specific articles

## Adding Images

1. Place images in the `public/` folder
2. Reference them with a leading slash: `/image-name.png`
3. Keep image names descriptive and URL-friendly

## Tips

- Keep slugs lowercase with hyphens (kebab-case)
- Use descriptive, SEO-friendly slugs
- Ensure all slugs are unique
- Add 3-6 tags per article for better categorization
- Include 2-3 related articles for better engagement
- Test your content locally before pushing

## Current Insights

- `agentic-ai` - Agentic AI is Revolutionizing the Industries
- `data-sovereign-asset` - Data is Going to Be Your New Sovereign Asset

## Need Help?

If you encounter issues or need to modify the structure, check:

1. Is the slug unique?
2. Is the import added to index.js?
3. Are all required fields filled?
4. Do image paths start with `/`?
