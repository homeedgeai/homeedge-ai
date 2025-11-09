// app/src/theme.ts

import { useColorScheme } from "react-native";

export const colors = {
  light: {
    background: "#FFFFFF",
    text: "#111827",
    textSecondary: "#6B7280",
    primary: "#2563EB",
    secondary: "#60A5FA",
  },
  dark: {
    background: "#0D1117",
    text: "#E5E7EB",
    textSecondary: "#9CA3AF",
    primary: "#3B82F6",
    secondary: "#93C5FD",
  },
};

// Spacing system (consistent with notifications.tsx)
export const spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
};

// Font sizes
export const fonts = {
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
};

// Hook to get correct color theme automatically
export const useTheme = () => {
  const scheme = useColorScheme() || "light";
  return {
    colors: colors[scheme],
    spacing,
    fonts,
    scheme,
  };
};

// Default export for non-hook use
export default { colors: colors.light, spacing, fonts };
