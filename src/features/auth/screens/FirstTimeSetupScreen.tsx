import React, { useMemo, useState } from "react";
import { Alert, TextInput, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { updatePassword } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { AuthStackParamList } from "../../../bootstrap/navigation/auth/AuthStack";
import { useAuth } from "../../../bootstrap/providers/AuthProvider";
import { db } from "../../../services/firebase/client";
import { Screen } from "../../../components/Screen";
import { AppText } from "../../../components/AppText";
import { Card } from "../../../components/Card";
import { PressableScale } from "../../../components/PressableScale";
import { useTheme } from "../../../bootstrap/providers/ThemeProvider";

type Props = NativeStackScreenProps<AuthStackParamList, "FirstTimeSetup">;

function makeAliases(seed: string) {
  const base = seed.replace(/[^A-Z0-9]/g, "");
  const n = base.slice(-3) || "000";
  return [`Quiet Comet ${n}`, `Silver Pine ${n}`, `Bright Atlas ${n}`];
}

export function FirstTimeSetupScreen({ route }: Props) {
  const { theme } = useTheme();
  const { session } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [alias, setAlias] = useState("");
  const [saving, setSaving] = useState(false);

  const aliasOptions = useMemo(
    () => makeAliases(route.params.uid.toUpperCase()),
    [route.params.uid]
  );

  async function onSave() {
    if (!session) return;
    if (newPassword.length < 8) {
      Alert.alert("Password", "Use at least 8 characters.");
      return;
    }
    if (!alias.trim()) {
      Alert.alert("Alias", "Choose an alias.");
      return;
    }

    try {
      setSaving(true);
      await updatePassword(session, newPassword);
      await updateDoc(doc(db, "users", session.uid), {
        alias: alias.trim(),
        mustChangePassword: false
      });
    } catch (e: any) {
      Alert.alert("Setup failed", e?.message ?? "Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen>
      <AppText variant="title">First-time setup</AppText>
      <AppText variant="muted" style={{ marginTop: 6 }}>
        Change your password and set a campus alias.
      </AppText>

      <View style={{ marginTop: theme.spacing.xl }}>
        <AppText variant="subtitle">New Password</AppText>
        <Card style={{ marginTop: theme.spacing.sm }}>
          <TextInput
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            placeholder="Create a strong password"
            placeholderTextColor={theme.colors.muted}
            style={{ color: theme.colors.text, fontSize: 16 }}
          />
        </Card>

        <View style={{ height: theme.spacing.lg }} />

        <AppText variant="subtitle">Campus Alias</AppText>
        <AppText variant="muted" style={{ marginTop: 6 }}>
          This is what others see by default.
        </AppText>

        {aliasOptions.map((a) => (
          <PressableScale key={a} onPress={() => setAlias(a)} style={{ marginTop: 10 }}>
            <Card
              style={{
                borderColor: alias === a ? theme.colors.accent : theme.colors.border
              }}
            >
              <AppText variant="subtitle">{a}</AppText>
            </Card>
          </PressableScale>
        ))}
      </View>

      <View style={{ flex: 1 }} />

      <PressableScale onPress={onSave} disabled={saving}>
        <Card
          style={{
            backgroundColor: theme.colors.accent,
            borderColor: theme.colors.accent,
            opacity: saving ? 0.7 : 1
          }}
        >
          <AppText variant="subtitle" style={{ color: "#FFFFFF" }}>
            {saving ? "Saving..." : "Finish"}
          </AppText>
        </Card>
      </PressableScale>
    </Screen>
  );
}

