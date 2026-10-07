import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@orion/i18n", "@orion/ui-tokens"],
};

export default nextConfig;
