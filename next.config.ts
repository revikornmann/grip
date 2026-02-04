import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpile the linked muka-ui package
  transpilePackages: ["muka-ui"],

  // Enable webpack for compatibility with npm link
  // Turbopack has issues with symlinked packages
  experimental: {
    // This helps webpack resolve symlinked packages correctly
  },

  webpack: (config) => {
    // Resolve symlinks to their real paths
    config.resolve.symlinks = true;
    return config;
  },
};

export default nextConfig;
