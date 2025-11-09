// app/components/themed-text.tsx
import React from "react";
import { Text, type TextProps } from "react-native";
import { useThemeColor } from "@hooks/use-theme-color";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  size?: number;
  weight?: "normal" | "bold" | "600" | "700";
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  size = 16,
  weight = "normal",
  ...otherProps
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

  return (
    <Text
      style={[
        { color, fontSize: size, fontWeight: weight },
        style,
      ]}
      {...otherProps}
    />
  );
}
