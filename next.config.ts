import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // muka-ui is consumed as a published package from GitHub Packages; transpile
  // it so its ESM/JSX is processed by this app's build.
  transpilePackages: ["@revikornmann/muka-ui"],
};

export default nextConfig;
