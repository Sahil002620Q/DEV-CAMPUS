import React from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { useTheme } from "../../../bootstrap/providers/ThemeProvider";
import { AppText } from "../../../components/AppText";
import { PressableScale } from "../../../components/PressableScale";

type Props = {
  visible: boolean;
  title: string;
  onClose: () => void;
  onSubmit: () => void;
  submitLabel?: string;
  loading?: boolean;
  children: React.ReactNode;
};

export function FormModal({
  visible,
  title,
  onClose,
  onSubmit,
  submitLabel = "Save",
  loading = false,
  children,
}: Props) {
  const { theme } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        style={{ flex: 1, backgroundColor: "#00000066", justifyContent: "flex-end" }}
        onPress={onClose}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <Pressable>
            <View
              style={{
                backgroundColor: theme.colors.surface,
                borderTopLeftRadius: theme.radius.lg,
                borderTopRightRadius: theme.radius.lg,
                padding: theme.spacing.xl,
                maxHeight: "90%",
              }}
            >
              {/* Header */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: theme.spacing.xl,
                }}
              >
                <AppText variant="subtitle" style={{ flex: 1 }}>
                  {title}
                </AppText>
                <PressableScale onPress={onClose}>
                  <AppText style={{ color: theme.colors.muted, fontSize: 22, lineHeight: 24 }}>
                    ×
                  </AppText>
                </PressableScale>
              </View>

              {/* Body */}
              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {children}
                <View style={{ height: theme.spacing.xl }} />
              </ScrollView>

              {/* Submit */}
              <PressableScale onPress={onSubmit} disabled={loading}>
                <View
                  style={{
                    backgroundColor: theme.colors.accent,
                    borderRadius: theme.radius.md,
                    padding: theme.spacing.lg,
                    alignItems: "center",
                    opacity: loading ? 0.7 : 1,
                    marginTop: theme.spacing.md,
                  }}
                >
                  <AppText style={{ color: "#fff", fontWeight: "600", fontSize: 16 }}>
                    {loading ? "Saving…" : submitLabel}
                  </AppText>
                </View>
              </PressableScale>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}
