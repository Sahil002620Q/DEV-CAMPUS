import React from "react";
import { View, ViewProps } from "react-native";
import { useTheme } from "../bootstrap/providers/ThemeProvider";

export function Card({ style, ...props }: ViewProps) {
  const { theme } = useTheme();
  return (
    <View
      {...props}
      style={[
        {
          backgroundColor: theme.colors.card,
          borderRadius: theme.radius.md,
          padding: theme.spacing.lg,
          borderWidth: 1,
          borderColor: theme.colors.border
        },
        style
      ]}
    />
  );
}

