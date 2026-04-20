import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  TextInput,
  View,
} from "react-native";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../../services/firebase/client";
import { assignRole, UserRole } from "../../../services/firebase/roles";
import { useAuth } from "../../../bootstrap/providers/AuthProvider";
import { Screen } from "../../../components/Screen";
import { AppText } from "../../../components/AppText";
import { PressableScale } from "../../../components/PressableScale";
import { AdminCard } from "../components/AdminCard";
import { RoleGuard } from "../components/RoleGuard";
import { useTheme } from "../../../bootstrap/providers/ThemeProvider";

const ASSIGNABLE_ROLES: { role: UserRole; label: string; color: string }[] = [
  { role: "cafeteria_admin", label: "Cafeteria Admin", color: "#F59E0B" },
  { role: "library_admin", label: "Library Admin", color: "#8B5CF6" },
  { role: "super_admin", label: "Super Admin", color: "#EF4444" },
  { role: "student", label: "Revoke (Student)", color: "#6B7280" },
];

type AdminUser = {
  uid: string;
  email?: string;
  alias?: string;
  role: UserRole;
};

export function ManageAdminsScreen() {
  const { theme } = useTheme();
  const { session } = useAuth();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<AdminUser | null | "not_found">(null);
  const [searching, setSearching] = useState(false);
  const [assigningUid, setAssigningUid] = useState<string | null>(null);

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const snap = await getDocs(
        query(collection(db, "users"), where("role", "in", [
          "cafeteria_admin",
          "library_admin",
          "super_admin",
        ]))
      );
      setAdmins(
        snap.docs.map((d) => ({
          uid: d.id,
          ...(d.data() as { email?: string; alias?: string; role: UserRole }),
        }))
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

  async function searchUser() {
    const q = searchQuery.trim().toUpperCase();
    if (!q) return;
    setSearching(true);
    setSearchResult(null);
    try {
      // Search by email derived from roll number pattern
      const email = `${q.toLowerCase()}@campus.local`;
      const snap = await getDocs(
        query(collection(db, "users"), where("email", "==", email))
      );
      if (snap.empty) {
        setSearchResult("not_found");
      } else {
        const d = snap.docs[0];
        setSearchResult({ uid: d.id, ...(d.data() as any) });
      }
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Search failed.");
    } finally {
      setSearching(false);
    }
  }

  async function handleAssign(targetUid: string, newRole: UserRole, targetAlias?: string) {
    if (!session?.uid) return;
    const roleInfo = ASSIGNABLE_ROLES.find((r) => r.role === newRole)!;
    Alert.alert(
      "Confirm Role Change",
      `Assign "${roleInfo.label}" to ${targetAlias ?? targetUid}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              setAssigningUid(targetUid);
              await assignRole(targetUid, newRole, session.uid);
              setSearchResult(null);
              setSearchQuery("");
              await fetchAdmins();
              Alert.alert("Done", "Role assigned successfully.");
            } catch (e: any) {
              Alert.alert("Error", e?.message ?? "Could not assign role.");
            } finally {
              setAssigningUid(null);
            }
          },
        },
      ]
    );
  }

  const ROLE_COLOR: Record<string, string> = {
    super_admin: "#EF4444",
    cafeteria_admin: "#F59E0B",
    library_admin: "#8B5CF6",
    student: "#6B7280",
  };

  function UserResult({ user }: { user: AdminUser }) {
    return (
      <View
        style={{
          backgroundColor: theme.colors.card,
          borderRadius: theme.radius.md,
          borderWidth: 1,
          borderColor: theme.colors.border,
          padding: theme.spacing.lg,
          marginBottom: theme.spacing.md,
        }}
      >
        <AppText variant="subtitle">{user.alias ?? user.uid}</AppText>
        <AppText variant="muted" style={{ marginTop: 2 }}>
          {user.email} · Current: {user.role}
        </AppText>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
            marginTop: theme.spacing.md,
          }}
        >
          {ASSIGNABLE_ROLES.filter((r) => r.role !== user.role).map((r) => (
            <PressableScale
              key={r.role}
              disabled={assigningUid === user.uid}
              onPress={() => handleAssign(user.uid, r.role, user.alias)}
            >
              <View
                style={{
                  backgroundColor: r.color + "22",
                  borderRadius: 20,
                  paddingHorizontal: 14,
                  paddingVertical: 7,
                  borderWidth: 1,
                  borderColor: r.color,
                }}
              >
                <AppText style={{ color: r.color, fontWeight: "600", fontSize: 13 }}>
                  {r.label}
                </AppText>
              </View>
            </PressableScale>
          ))}
        </View>
      </View>
    );
  }

  return (
    <RoleGuard requiredRole="super_admin">
      <Screen style={{ paddingHorizontal: 0 }}>
        <FlatList
          contentContainerStyle={{ paddingHorizontal: theme.spacing.lg, paddingBottom: 32 }}
          ListHeaderComponent={
            <>
              {/* Header */}
              <View style={{ paddingTop: theme.spacing.lg, marginBottom: theme.spacing.xl }}>
                <AppText variant="title">Manage Admins</AppText>
                <AppText variant="muted" style={{ marginTop: 3 }}>
                  Search a student by roll number to assign a role.
                </AppText>
              </View>

              {/* Search box */}
              <View
                style={{
                  flexDirection: "row",
                  gap: theme.spacing.sm,
                  marginBottom: theme.spacing.xl,
                }}
              >
                <View
                  style={{
                    flex: 1,
                    backgroundColor: theme.colors.card,
                    borderRadius: theme.radius.md,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    paddingHorizontal: theme.spacing.lg,
                    paddingVertical: theme.spacing.md,
                  }}
                >
                  <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onSubmitEditing={searchUser}
                    returnKeyType="search"
                    placeholder="Roll number (e.g. 23CSE115)"
                    placeholderTextColor={theme.colors.muted}
                    autoCapitalize="characters"
                    style={{ color: theme.colors.text, fontSize: 15 }}
                  />
                </View>
                <PressableScale onPress={searchUser} disabled={searching}>
                  <View
                    style={{
                      backgroundColor: theme.colors.accent,
                      borderRadius: theme.radius.md,
                      paddingHorizontal: theme.spacing.lg,
                      justifyContent: "center",
                      opacity: searching ? 0.7 : 1,
                    }}
                  >
                    <AppText style={{ color: "#fff", fontWeight: "600" }}>
                      {searching ? "…" : "Search"}
                    </AppText>
                  </View>
                </PressableScale>
              </View>

              {/* Search result */}
              {searchResult === "not_found" && (
                <View
                  style={{
                    backgroundColor: theme.colors.danger + "22",
                    borderRadius: theme.radius.md,
                    padding: theme.spacing.lg,
                    marginBottom: theme.spacing.lg,
                    borderWidth: 1,
                    borderColor: theme.colors.danger,
                  }}
                >
                  <AppText style={{ color: theme.colors.danger }}>
                    No user found with that roll number.
                  </AppText>
                </View>
              )}
              {searchResult && searchResult !== "not_found" && (
                <UserResult user={searchResult} />
              )}

              {/* Existing admins list header */}
              <AppText variant="subtitle" style={{ marginBottom: theme.spacing.md }}>
                Current Admins
              </AppText>
            </>
          }
          data={loading ? [] : admins}
          keyExtractor={(i) => i.uid}
          ListEmptyComponent={
            loading ? (
              <AppText variant="muted" style={{ textAlign: "center", marginTop: 20 }}>
                Loading…
              </AppText>
            ) : (
              <AppText variant="muted" style={{ textAlign: "center", marginTop: 20 }}>
                No admins yet.
              </AppText>
            )
          }
          renderItem={({ item }) => (
            <AdminCard
              title={item.alias ?? item.uid}
              subtitle={item.email ?? ""}
              badge={item.role.replace(/_/g, " ")}
              badgeColor={ROLE_COLOR[item.role]}
              onEdit={() => {
                setSearchResult(item);
                setSearchQuery("");
              }}
            />
          )}
        />
      </Screen>
    </RoleGuard>
  );
}
