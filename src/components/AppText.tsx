import React from "react";
import { Text, TextProps } from "react-native";
import { useTheme } from "../bootstrap/providers/ThemeProvider";

type Variant = "title" | "subtitle" | "body" | "muted";

export function AppText({
  variant = "body",
  style,
  ...props
}: TextProps & { variant?: Variant }) {
  const { theme } = useTheme();
  const base =
    variant === "title"
      ? theme.typography.title
      : variant === "subtitle"
        ? theme.typography.subtitle
        : variant === "muted"
          ? theme.typography.muted
          : theme.typography.body;

  const color = variant === "muted" ? theme.colors.muted : theme.colors.text;

  return (
    <Text
      {...props}
      style={[
        { color, fontFamily: undefined, letterSpacing: 0.2 },
        base,
        style
      ]}
    />
  );
}

