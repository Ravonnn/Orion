import rn from "@orion/config/eslint/react-native";

export default [
  ...rn,
  {
    ignores: [
      ".expo/**",
      "expo-env.d.ts",
      "nativewind-env.d.ts",
      "babel.config.js",
      "metro.config.js",
      "tailwind.config.js",
    ],
  },
];

