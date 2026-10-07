import base from "@orion/config/eslint/base";

export default [
  ...base,
  {
    ignores: ["src/database.types.ts"],
  },
];
