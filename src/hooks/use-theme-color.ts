import { useColorScheme } from "react-native";

/**
 * Small helper that returns the appropriate color based on the current theme.
 * It mirrors Expo’s default theming hook behavior.
 */
export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: "text" | "background" | "tint" | "border" = "text"
) {
  const theme = useColorScheme() ?? "light";

  const colors = {
    light: {
      text: "#11181C",
      background: "#fff",
      tint: "#2563EB",
      border: "#e5e7eb",
    },
    dark: {
      text: "#ECEDEE",
      background: "#000",
      tint: "#3B82F6",
      border: "#27272a",
    },
  };

  return props[theme] ?? colors[theme][colorName];
}
