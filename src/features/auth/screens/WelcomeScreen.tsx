import React from "react";
import { View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../../bootstrap/navigation/auth/AuthStack";
import { Screen } from "../../../components/Screen";
import { AppText } from "../../../components/AppText";
import { PressableScale } from "../../../components/PressableScale";
import { Card } from "../../../components/Card";
import { useTheme } from "../../../bootstrap/providers/ThemeProvider";

type Props = NativeStackScreenProps<AuthStackParamList, "Welcome">;

export function WelcomeScreen({ navigation }: Props) {
  const { theme } = useTheme();

  return (
    <Screen>
      <View style={{ marginTop: theme.spacing.xl }}>
        <AppText variant="title">Campus</AppText>
        <AppText variant="muted" style={{ marginTop: 8 }}>
          A clean college app for notices, cafeteria, lost & found, and private chat.
        </AppText>
      </View>

      <View style={{ flex: 1 }} />

      <PressableScale onPress={() => navigation.navigate("Login")}>
        <Card
          style={{
            backgroundColor: theme.colors.accent,
            borderColor: theme.colors.accent
          }}
        >
          <AppText variant="subtitle" style={{ color: "#FFFFFF" }}>
            Sign in with College ID
          </AppText>
        </Card>
      </PressableScale>

      <View style={{ height: theme.spacing.lg }} />
    </Screen>
  );
}

