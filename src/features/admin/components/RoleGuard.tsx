import React from "react";
import { View } from "react-native";
import { UserRole } from "../../../services/firebase/roles";
import { useRole } from "../../../bootstrap/providers/RoleProvider";
import { AppText } from "../../../components/AppText";
import { useTheme } from "../../../bootstrap/providers/ThemeProvider";

type Props = {
  requiredRole: UserRole | UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export function RoleGuard({ requiredRole, children, fallback }: Props) {
  const { role } = useRole();
  const { theme } = useTheme();
  const allowed = Array.isArray(requiredRole)
    ? requiredRole.includes(role)
    : role === requiredRole || role === "super_admin";

  if (!allowed) {
    return (
      fallback ?? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 32,
          }}
        >
          <AppText style={{ fontSize: 40 }}>🚫</AppText>
          <AppText variant="subtitle" style={{ marginTop: 16, textAlign: "center" }}>
            Access Denied
          </AppText>
          <AppText variant="muted" style={{ marginTop: 8, textAlign: "center" }}>
            You don't have permission to view this section.
          </AppText>
        </View>
      )
    );
  }

  return <>{children}</>;
}
