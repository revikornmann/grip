import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpile the muka-ui design system package (consumed as a git dependency)
  transpilePackages: ["@revikornmann/muka-ui"],
};

export default nextConfig;
