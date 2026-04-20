import React from "react";
import { Screen } from "../../../components/Screen";
import { AppText } from "../../../components/AppText";
import { Card } from "../../../components/Card";
import { useTheme } from "../../../bootstrap/providers/ThemeProvider";

export function InboxScreen() {
  const { theme } = useTheme();

  return (
    <Screen>
      <AppText variant="title">Inbox</AppText>
      <AppText variant="muted" style={{ marginTop: 6 }}>
        Chats and anonymous messages.
      </AppText>

      <Card style={{ marginTop: theme.spacing.xl }}>
        <AppText variant="subtitle">Tabs</AppText>
        <AppText variant="muted" style={{ marginTop: 6 }}>
          Chats | Anonymous Box
        </AppText>
      </Card>
    </Screen>
  );
}

