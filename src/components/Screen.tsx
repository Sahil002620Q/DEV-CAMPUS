import React from "react";
import { View, ViewProps } from "react-native";
import { useTheme } from "../bootstrap/providers/ThemeProvider";

export function Screen({ style, ...props }: ViewProps) {
  const { theme } = useTheme();
  return (
    <View
      {...props}
      style={[
        {
          flex: 1,
          paddingHorizontal: theme.spacing.lg,
          paddingTop: theme.spacing.lg,
          backgroundColor: theme.colors.bg
        },
        style
      ]}
    />
  );
}

