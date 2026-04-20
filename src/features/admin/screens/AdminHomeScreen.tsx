import React from "react";
import { ScrollView, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AdminStackParamList } from "../../../bootstrap/navigation/admin/AdminStack";
import { Screen } from "../../../components/Screen";
import { AppText } from "../../../components/AppText";
import { PressableScale } from "../../../components/PressableScale";
import { useTheme } from "../../../bootstrap/providers/ThemeProvider";
import { useRole } from "../../../bootstrap/providers/RoleProvider";

type Props = NativeStackScreenProps<AdminStackParamList, "AdminHome">;

type SectionCard = {
  emoji: string;
  title: string;
  subtitle: string;
  route: keyof AdminStackParamList;
  color: string;
  visible: boolean;
};

export function AdminHomeScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { role, isCafeteriaAdmin, isLibraryAdmin, isSuperAdmin } = useRole();

  const roleLabel: Record<string, string> = {
    super_admin: "Super Admin",
    cafeteria_admin: "Cafeteria Admin",
    library_admin: "Library Admin",
    student: "Student",
  };

  const sections: SectionCard[] = [
    {
      emoji: "🍽️",
      title: "Cafeteria Menu",
      subtitle: "Manage daily menu items, prices & availability",
      route: "CafeteriaMenu",
      color: "#F59E0B",
      visible: isCafeteriaAdmin,
    },
    {
      emoji: "📚",
      title: "Library",
      subtitle: "Add books, PDFs & announcements",
      route: "Library",
      color: "#8B5CF6",
      visible: isLibraryAdmin,
    },
    {
      emoji: "👤",
      title: "Manage Admins",
      subtitle: "Assign or revoke admin roles",
      route: "ManageAdmins",
      color: "#EF4444",
      visible: isSuperAdmin,
    },
  ].filter((s) => s.visible);

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ paddingTop: theme.spacing.lg }}>
          <AppText variant="muted">Welcome back,</AppText>
          <AppText variant="title" style={{ marginTop: 2 }}>
            Admin Panel
          </AppText>
          <View
            style={{
              marginTop: theme.spacing.sm,
              alignSelf: "flex-start",
              backgroundColor: theme.colors.accent + "22",
              borderRadius: 20,
              paddingHorizontal: 12,
              paddingVertical: 4,
            }}
          >
            <AppText style={{ color: theme.colors.accent, fontSize: 13, fontWeight: "600" }}>
              {roleLabel[role] ?? role}
            </AppText>
          </View>
        </View>

        <View style={{ height: theme.spacing.xl }} />

        {/* Section cards */}
        {sections.map((s) => (
          <PressableScale
            key={s.route}
            onPress={() => navigation.navigate(s.route as any)}
            style={{ marginBottom: theme.spacing.md }}
          >
            <View
              style={{
                backgroundColor: theme.colors.card,
                borderRadius: theme.radius.lg,
                borderWidth: 1,
                borderColor: theme.colors.border,
                padding: theme.spacing.xl,
                flexDirection: "row",
                alignItems: "center",
                gap: theme.spacing.lg,
              }}
            >
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  backgroundColor: s.color + "22",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AppText style={{ fontSize: 28 }}>{s.emoji}</AppText>
              </View>
              <View style={{ flex: 1 }}>
                <AppText variant="subtitle">{s.title}</AppText>
                <AppText variant="muted" style={{ marginTop: 3 }}>
                  {s.subtitle}
                </AppText>
              </View>
              <AppText style={{ color: theme.colors.muted, fontSize: 20 }}>›</AppText>
            </View>
          </PressableScale>
        ))}

        {sections.length === 0 && (
          <View style={{ alignItems: "center", paddingTop: 60 }}>
            <AppText style={{ fontSize: 48 }}>🔒</AppText>
            <AppText variant="subtitle" style={{ marginTop: 16 }}>
              No sections assigned yet
            </AppText>
            <AppText variant="muted" style={{ marginTop: 8, textAlign: "center" }}>
              Ask a super admin to assign your role in the app.
            </AppText>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </Screen>
  );
}
