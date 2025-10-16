// src/theme.ts
export const colors = {
  primary: "#3B82F6",    // main blue
  accent: "#1D4ED8",     // darker blue
  bg: "#FFFFFF",
  surface: "#F9FAFB",    // card / input background
  divider: "#E5E7EB",    // line separators
  text: "#111827",       // dark gray
  subtext: "#6B7280",    // lighter gray
  success: "#16A34A",    // green
  danger: "#EF4444",     // red
};

export const spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
};

export const fonts = {
  h1: { fontSize: 22, fontWeight: "700", color: colors.text },
  h2: { fontSize: 18, fontWeight: "600", color: colors.text },
  body: { fontSize: 16, color: colors.text },
  small: { fontSize: 13, color: colors.subtext },
};
