import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Appearance, ColorSchemeName } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { lightTheme, darkTheme, Theme } from "../../theme/themes";

export type ThemeMode = "system" | "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveTheme(mode: ThemeMode, system: ColorSchemeName): Theme {
  if (mode === "light") return lightTheme;
  if (mode === "dark") return darkTheme;
  return system === "dark" ? darkTheme : lightTheme;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("system");
  const [systemScheme, setSystemScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme()
  );

  const fade = useSharedValue(1);

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme);
    });
    return () => sub.remove();
  }, []);

  const theme = useMemo(() => resolveTheme(mode, systemScheme), [mode, systemScheme]);

  useEffect(() => {
    fade.value = 0;
    fade.value = withTiming(1, { duration: 240, easing: Easing.out(Easing.cubic) });
  }, [theme, fade]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: fade.value }));

  const value = useMemo(
    () => ({
      theme,
      mode,
      setMode: (m: ThemeMode) => setMode(m)
    }),
    [theme, mode]
  );

  return (
    <ThemeContext.Provider value={value}>
      <Animated.View style={[{ flex: 1, backgroundColor: theme.colors.bg }, animatedStyle]}>
        {children}
      </Animated.View>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

