import React from "react";
import { View, ViewStyle } from "react-native";
import { AppText } from "../../../components/AppText";
import { PressableScale } from "../../../components/PressableScale";
import { useTheme } from "../../../bootstrap/providers/ThemeProvider";

type Props = {
  title: string;
  subtitle?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  style?: ViewStyle;
  children?: React.ReactNode;
  badge?: string;
  badgeColor?: string;
};

export function AdminCard({
  title,
  subtitle,
  onEdit,
  onDelete,
  style,
  children,
  badge,
  badgeColor,
}: Props) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.card,
          borderRadius: theme.radius.md,
          borderWidth: 1,
          borderColor: theme.colors.border,
          padding: theme.spacing.lg,
          marginBottom: theme.spacing.sm,
        },
        style,
      ]}
    >
      <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <AppText variant="subtitle">{title}</AppText>
            {badge ? (
              <View
                style={{
                  backgroundColor: badgeColor ?? theme.colors.accent,
                  borderRadius: 20,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                }}
              >
                <AppText style={{ color: "#fff", fontSize: 11, fontWeight: "600" }}>
                  {badge}
                </AppText>
              </View>
            ) : null}
          </View>
          {subtitle ? (
            <AppText variant="muted" style={{ marginTop: 3 }}>
              {subtitle}
            </AppText>
          ) : null}
          {children}
        </View>

        <View style={{ flexDirection: "row", gap: 8, marginLeft: theme.spacing.md }}>
          {onEdit && (
            <PressableScale onPress={onEdit}>
              <View
                style={{
                  backgroundColor: theme.colors.accent + "22",
                  borderRadius: theme.radius.sm,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                }}
              >
                <AppText style={{ color: theme.colors.accent, fontSize: 13, fontWeight: "600" }}>
                  Edit
                </AppText>
              </View>
            </PressableScale>
          )}
          {onDelete && (
            <PressableScale onPress={onDelete}>
              <View
                style={{
                  backgroundColor: theme.colors.danger + "22",
                  borderRadius: theme.radius.sm,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                }}
              >
                <AppText style={{ color: theme.colors.danger, fontSize: 13, fontWeight: "600" }}>
                  Delete
                </AppText>
              </View>
            </PressableScale>
          )}
        </View>
      </View>
    </View>
  );
}
