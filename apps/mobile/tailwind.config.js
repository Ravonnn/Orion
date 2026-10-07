const { orionNativeWindTheme } = require("@orion/ui-tokens/nativewind.cjs");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: orionNativeWindTheme,
  },
  plugins: [],
};
