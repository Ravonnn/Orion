/** CommonJS theme for NativeWind / Tailwind (apps/mobile). Keep in sync with src/index.ts */
const colors = {
  background: "#0B0D10",
  surface: "#141820",
  "surface-elevated": "#1C2230",
  border: "#2A3344",
  foreground: "#F4F6FA",
  muted: "#9AA3B5",
  accent: "#3DDC97",
  "accent-muted": "#2A9B6A",
  danger: "#F07178",
  warning: "#E6C07B",
};

const spacing = {
  0: "0px",
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "20px",
  6: "24px",
  8: "32px",
  10: "40px",
  12: "48px",
  16: "64px",
};

module.exports = {
  orionNativeWindTheme: {
    colors,
    spacing,
    fontFamily: {
      sans: ['"IBM Plex Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
      display: ['"IBM Plex Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
      mono: ['"IBM Plex Mono"', "ui-monospace", "monospace"],
    },
  },
};
