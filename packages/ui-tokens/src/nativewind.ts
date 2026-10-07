import { colors, spacing, typography } from "./index.js";

/** Shared NativeWind / Tailwind theme extension used by apps/mobile */
export const orionNativeWindTheme = {
  colors: {
    background: colors.background,
    surface: colors.surface,
    "surface-elevated": colors.surfaceElevated,
    border: colors.border,
    foreground: colors.foreground,
    muted: colors.muted,
    accent: colors.accent,
    "accent-muted": colors.accentMuted,
    danger: colors.danger,
    warning: colors.warning,
  },
  spacing,
  fontFamily: {
    sans: typography.fontFamily.sans,
    display: typography.fontFamily.display,
    mono: typography.fontFamily.mono,
  },
  fontSize: typography.fontSize,
} as const;
