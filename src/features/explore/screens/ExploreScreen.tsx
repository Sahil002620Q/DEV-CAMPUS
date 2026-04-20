import React from "react";
import { Screen } from "../../../components/Screen";
import { AppText } from "../../../components/AppText";
import { Card } from "../../../components/Card";
import { useTheme } from "../../../bootstrap/providers/ThemeProvider";

export function ExploreScreen() {
  const { theme } = useTheme();
  return (
    <Screen>
      <AppText variant="title">Explore</AppText>
      <AppText variant="muted" style={{ marginTop: 6 }}>
        Cafeteria, notices, lost & found, and quick links.
      </AppText>

      <Card style={{ marginTop: theme.spacing.xl }}>
        <AppText variant="subtitle">Segments</AppText>
        <AppText variant="muted" style={{ marginTop: 6 }}>
          Cafeteria | Notices | Lost & Found | Links
        </AppText>
      </Card>
    </Screen>
  );
}

