import { colors, spacing, typography } from "./index.js";

/** Shared Tailwind theme extension used by apps/web */
export const orionTailwindTheme = {
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
  fontFamily: typography.fontFamily,
  fontSize: typography.fontSize,
} as const;
