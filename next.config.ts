import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpile the muka-ui design system package (consumed as a git dependency)
  transpilePackages: ["@revikornmann/muka-ui"],

  webpack(config) {
    // `@revikornmann/muka-ui` is a GitHub dependency tracking `#main`: its
    // contents change on every release but its package.json version stays
    // pinned at 0.1.0. Webpack's persistent cache treats everything under
    // node_modules as immutable and keys cached modules by that version
    // string (snapshot.managedPaths), so it happily serves a *stale* compiled
    // muka after the SHA advances — e.g. a build that ran before `AppShell`
    // existed keeps reusing the cached, AppShell-less module on Vercel where
    // .next/cache is restored between deploys. Marking muka as "unmanaged"
    // forces webpack to hash its actual contents instead of trusting the
    // version, so a new SHA always recompiles.
    config.snapshot = {
      ...(config.snapshot ?? {}),
      unmanagedPaths: [
        ...((config.snapshot && config.snapshot.unmanagedPaths) ?? []),
        /[\\/]node_modules[\\/]@revikornmann[\\/]muka-ui[\\/]/,
      ],
    };
    return config;
  },
};

export default nextConfig;
