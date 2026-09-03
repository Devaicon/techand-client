/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  reactCompiler: true,
  poweredByHeader: false,
  compress: true,

  images: {
    unoptimized: true,
    // Blog images are uploaded to Cloudinary from the admin panel. Listed even
    // though `unoptimized` bypasses the optimizer, so that turning optimization
    // back on later does not silently break every article image.
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  async headers() {
    return [
      {
        source: "/:all*(svg|jpg|jpeg|png|webp|avif|gif|ico)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:path*",
        headers: [
          {
            // Every page has two representations — HTML and, under
            // `Accept: text/markdown`, Markdown (see src/proxy.js). Without
            // Accept in Vary, a CDN serves whichever variant it cached first to
            // everyone: agents get HTML, or browsers get a .md download.
            //
            // Set here rather than in the proxy because Next.js writes its own
            // Vary (`rsc, next-router-state-tree, …`) while rendering an App
            // Router response, which replaces anything the proxy set. A header
            // declared in next.config survives that, and Next merges this value
            // with its own rather than dropping either.
            key: "Vary",
            value: "Accept",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate", // No caching for pages
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },

  async redirects() {
    return [
      {
        source: "/whywithtech&",
        destination: "/whywith-techand",
        permanent: true,
      },
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
    ];
  },

  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
