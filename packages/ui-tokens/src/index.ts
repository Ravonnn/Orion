export const colors = {
  background: "#0B0D10",
  surface: "#141820",
  surfaceElevated: "#1C2230",
  border: "#2A3344",
  foreground: "#F4F6FA",
  muted: "#9AA3B5",
  accent: "#3DDC97",
  accentMuted: "#2A9B6A",
  danger: "#F07178",
  warning: "#E6C07B",
} as const;

export const spacing = {
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
} as const;

export const typography = {
  fontFamily: {
    sans: ['"IBM Plex Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
    display: ['"IBM Plex Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
    mono: ['"IBM Plex Mono"', "ui-monospace", "monospace"],
  },
  fontSize: {
    xs: ["12px", { lineHeight: "16px" }],
    sm: ["14px", { lineHeight: "20px" }],
    base: ["16px", { lineHeight: "24px" }],
    lg: ["18px", { lineHeight: "28px" }],
    xl: ["20px", { lineHeight: "28px" }],
    "2xl": ["24px", { lineHeight: "32px" }],
    "3xl": ["30px", { lineHeight: "36px" }],
  },
} as const;

export type OrionColors = typeof colors;
export type OrionSpacing = typeof spacing;
