import React, { useEffect } from "react";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Screen } from "../../../components/Screen";
import { AppText } from "../../../components/AppText";

/**
 * Placeholder screen for the center tab button.
 * In production, you would open a bottom sheet here (or a modal).
 */
export function PostLauncher() {
  const navigation = useNavigation<any>();

  useEffect(() => {
    // Example: open a modal/bottom sheet
    // navigation.navigate("PostSheet");
  }, [navigation]);

  return (
    <Screen>
      <View>
        <AppText variant="title">Post</AppText>
        <AppText variant="muted" style={{ marginTop: 6 }}>
          This will become the post bottom sheet: Lost, Found, Review, Anonymous.
        </AppText>
      </View>
    </Screen>
  );
}

