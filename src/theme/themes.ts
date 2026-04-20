import { radius, spacing, typography } from "./tokens";

export type Theme = {
  radius: typeof radius;
  spacing: typeof spacing;
  typography: typeof typography;
  colors: {
    bg: string;
    surface: string;
    card: string;
    text: string;
    muted: string;
    border: string;
    accent: string;
    danger: string;
    success: string;
  };
};

export const lightTheme: Theme = {
  radius,
  spacing,
  typography,
  colors: {
    bg: "#F7F8FA",
    surface: "#FFFFFF",
    card: "#FFFFFF",
    text: "#0B0F14",
    muted: "#667085",
    border: "#E5E7EB",
    accent: "#3B82F6",
    danger: "#EF4444",
    success: "#22C55E"
  }
};

export const darkTheme: Theme = {
  radius,
  spacing,
  typography,
  colors: {
    bg: "#0B0F14",
    surface: "#0F1520",
    card: "#121A26",
    text: "#E7EAF0",
    muted: "#A1A7B3",
    border: "#1F2A3A",
    accent: "#60A5FA",
    danger: "#F87171",
    success: "#4ADE80"
  }
};

