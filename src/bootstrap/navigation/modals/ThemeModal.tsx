import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Screen } from "../../../components/Screen";
import { AppText } from "../../../components/AppText";
import { ThemeMode, useTheme } from "../../providers/ThemeProvider";
import { Card } from "../../../components/Card";
import { PressableScale } from "../../../components/PressableScale";

const MODES: Array<{ mode: ThemeMode; title: string; subtitle: string }> = [
  { mode: "system", title: "System", subtitle: "Match device settings" },
  { mode: "light", title: "Light", subtitle: "Bright and clean" },
  { mode: "dark", title: "Dark", subtitle: "Easy on the eyes" }
];

export function ThemeModal() {
  const { theme, mode, setMode } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <Screen>
        <AppText variant="title">Appearance</AppText>
        <AppText variant="muted" style={{ marginTop: 6 }}>
          Choose how the app looks.
        </AppText>

        {MODES.map((m) => (
          <PressableScale
            key={m.mode}
            onPress={() => setMode(m.mode)}
            style={{ marginTop: 12 }}
          >
            <Card
              style={{
                borderColor:
                  mode === m.mode ? theme.colors.accent : theme.colors.border
              }}
            >
              <AppText variant="subtitle">{m.title}</AppText>
              <AppText variant="muted" style={{ marginTop: 4 }}>
                {m.subtitle}
              </AppText>
            </Card>
          </PressableScale>
        ))}
      </Screen>
    </SafeAreaView>
  );
}

