import React, { useState } from "react";
import { Alert, TextInput, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { signInWithEmailAndPassword } from "firebase/auth";
import { AuthStackParamList } from "../../../bootstrap/navigation/auth/AuthStack";
import { auth } from "../../../services/firebase/client";
import { rollNumberToEmail } from "../../../utils/rollNumber";
import { Screen } from "../../../components/Screen";
import { AppText } from "../../../components/AppText";
import { Card } from "../../../components/Card";
import { PressableScale } from "../../../components/PressableScale";
import { useTheme } from "../../../bootstrap/providers/ThemeProvider";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const [rollNumber, setRollNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function onLogin() {
    setErrorMsg(null);
    const rn = rollNumber.trim().toUpperCase();
    if (!rn || password.length < 4) {
      setErrorMsg("Check details: Enter your roll number and password (min 4 chars).");
      return;
    }

    try {
      setLoading(true);
      const email = rollNumberToEmail(rn);
      const res = await signInWithEmailAndPassword(auth, email, password);
      // If your Firestore user doc has mustChangePassword, you can route to setup here.
      // For now we always allow entry; the RootNavigator will switch automatically.
      if (res.user?.uid) {
        // Optional: route to FirstTimeSetup based on Firestore flag (add next).
      }
    } catch (e: any) {
      console.error("Login Error:", e);
      setErrorMsg(e?.message ?? "Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <AppText variant="title">Sign in</AppText>
      <AppText variant="muted" style={{ marginTop: 6 }}>
        Use your college roll number and password.
      </AppText>

      <View style={{ marginTop: theme.spacing.xl }}>
        <AppText variant="subtitle">Roll Number</AppText>
        <Card style={{ marginTop: theme.spacing.sm }}>
          <TextInput
            value={rollNumber}
            onChangeText={setRollNumber}
            autoCapitalize="characters"
            autoCorrect={false}
            placeholder="23CSE115"
            placeholderTextColor={theme.colors.muted}
            style={{ color: theme.colors.text, fontSize: 16 }}
          />
        </Card>

        <View style={{ height: theme.spacing.lg }} />

        <AppText variant="subtitle">Password</AppText>
        <Card style={{ marginTop: theme.spacing.sm }}>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Your password"
            placeholderTextColor={theme.colors.muted}
            style={{ color: theme.colors.text, fontSize: 16 }}
          />
        </Card>
      </View>

      <View style={{ flex: 1 }} />
      
      {errorMsg ? (
        <AppText style={{ color: "red", marginBottom: 12, textAlign: "center" }}>
          {errorMsg}
        </AppText>
      ) : null}

      <PressableScale onPress={onLogin} disabled={loading}>
        <Card
          style={{
            backgroundColor: theme.colors.accent,
            borderColor: theme.colors.accent,
            opacity: loading ? 0.7 : 1
          }}
        >
          <AppText variant="subtitle" style={{ color: "#FFFFFF" }}>
            {loading ? "Signing in..." : "Continue"}
          </AppText>
        </Card>
      </PressableScale>
    </Screen>
  );
}

