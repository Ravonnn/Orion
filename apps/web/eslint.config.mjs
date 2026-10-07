import nextConfig from "@orion/config/eslint/next";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...nextConfig,
  {
    ignores: [".next/**", "next-env.d.ts"],
  },
];
