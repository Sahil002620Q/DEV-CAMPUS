import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../providers/AuthProvider";
import { AuthStack } from "./auth/AuthStack";
import { AppTabs } from "./tabs/AppTabs";
import { ThemeModal } from "./modals/ThemeModal";

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
  ThemeModal: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { session } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {session ? (
        <>
          <Stack.Screen name="App" component={AppTabs} />
          <Stack.Screen
            name="ThemeModal"
            component={ThemeModal}
            options={{ presentation: "modal" }}
          />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
}

