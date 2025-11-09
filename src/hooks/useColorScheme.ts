import { useColorScheme as _useColorScheme } from "react-native";

/**
 * Returns either "light" or "dark" depending on the device theme.
 * Always defaults to "light" if undefined.
 */
export function useColorScheme() {
  return _useColorScheme() ?? "light";
}
