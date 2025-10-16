// hooks/useColorScheme.ts
import { useColorScheme as _useColorScheme } from "react-native";

/**
 * A hook that returns either "light" or "dark".
 * Falls back to "light" if no scheme is available.
 */
export function useColorScheme(): "light" | "dark" {
  return _useColorScheme() ?? "light";
}
