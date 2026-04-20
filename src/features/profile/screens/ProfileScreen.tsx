import React from "react";
import { Alert, View } from "react-native";
import { signOut } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import { auth } from "../../../services/firebase/client";
import { Screen } from "../../../components/Screen";
import { AppText } from "../../../components/AppText";
import { Card } from "../../../components/Card";
import { PressableScale } from "../../../components/PressableScale";
import { useTheme } from "../../../bootstrap/providers/ThemeProvider";

export function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();

  async function onLogout() {
    try {
      await signOut(auth);
    } catch (e: any) {
      Alert.alert("Logout failed", e?.message ?? "Please try again.");
    }
  }

  return (
    <Screen>
      <AppText variant="title">Profile</AppText>
      <AppText variant="muted" style={{ marginTop: 6 }}>
        Alias, saved items, and settings.
      </AppText>

      <Card style={{ marginTop: theme.spacing.xl }}>
        <AppText variant="subtitle">Settings</AppText>
        <AppText variant="muted" style={{ marginTop: 6 }}>
          Theme, privacy, notifications.
        </AppText>
      </Card>

      <View style={{ height: theme.spacing.lg }} />

      <PressableScale onPress={() => navigation.navigate("ThemeModal")}>
        <Card>
          <AppText variant="subtitle">Appearance</AppText>
          <AppText variant="muted" style={{ marginTop: 6 }}>
            Change theme (animated).
          </AppText>
        </Card>
      </PressableScale>

      <View style={{ flex: 1 }} />

      <PressableScale onPress={onLogout}>
        <Card style={{ borderColor: theme.colors.danger }}>
          <AppText variant="subtitle" style={{ color: theme.colors.danger }}>
            Logout
          </AppText>
        </Card>
      </PressableScale>
    </Screen>
  );
}

