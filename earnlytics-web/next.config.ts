import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization
  images: {
    formats: ["image/webp", "image/avif"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "logo.clearbit.com",
      },
    ],
    minimumCacheTTL: 60,
  },

  // Compression
  compress: true,

  // Code splitting and optimization
  experimental: {
    optimizePackageImports: [
      "recharts",
      "framer-motion",
      "lucide-react",
    ],
  },

  // Webpack configuration for code splitting
  webpack: (config, { isServer }) => {
    // Split chunks for better caching
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: "all",
        cacheGroups: {
          // Vendor chunk for node_modules
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
          },
          // Charts chunk
          charts: {
            test: /[\\/]node_modules[\\/](recharts|d3)[\\/]/,
            name: "charts",
            chunks: "all",
            priority: 10,
          },
          // Animation chunk
          animation: {
            test: /[\\/]node_modules[\\/](framer-motion)[\\/]/,
            name: "animation",
            chunks: "all",
            priority: 5,
          },
        },
      };
    }
    return config;
  },

  // Headers for caching and security
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  turbopack: {
    resolveExtensions: [".tsx", ".ts", ".jsx", ".js"],
    root: "/Users/justin/Desktop/earnlytics/earnlytics-web",
  },
};

export default nextConfig;
