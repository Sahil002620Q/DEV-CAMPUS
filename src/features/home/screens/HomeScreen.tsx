import React from "react";
import { ScrollView, View } from "react-native";
import { useTheme } from "../../../bootstrap/providers/ThemeProvider";
import { Screen } from "../../../components/Screen";
import { AppText } from "../../../components/AppText";
import { Card } from "../../../components/Card";

export function HomeScreen() {
  const { theme } = useTheme();

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <AppText variant="title">Home</AppText>
        <AppText variant="muted" style={{ marginTop: 6 }}>
          Today’s important updates and quick actions.
        </AppText>

        <Card style={{ marginTop: theme.spacing.xl }}>
          <AppText variant="subtitle">Today</AppText>
          <AppText variant="muted" style={{ marginTop: 6 }}>
            - Pinned notices will appear here
          </AppText>
        </Card>

        <View style={{ height: theme.spacing.lg }} />

        <Card>
          <AppText variant="subtitle">Quick Actions</AppText>
          <AppText variant="muted" style={{ marginTop: 6 }}>
            Cafeteria • Lost & Found • Notices • Links • Anonymous Box
          </AppText>
        </Card>

        <View style={{ height: theme.spacing.lg }} />

        <Card>
          <AppText variant="subtitle">Cafeteria spotlight</AppText>
          <AppText variant="muted" style={{ marginTop: 6 }}>
            Available items will show here.
          </AppText>
        </Card>

        <View style={{ height: theme.spacing.lg }} />

        <Card>
          <AppText variant="subtitle">Lost & Found</AppText>
          <AppText variant="muted" style={{ marginTop: 6 }}>
            Recent lost/found posts will show here.
          </AppText>
        </Card>

        <View style={{ height: theme.spacing.xl }} />
      </ScrollView>
    </Screen>
  );
}

