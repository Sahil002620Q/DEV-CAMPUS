import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { WelcomeScreen } from "../../../features/auth/screens/WelcomeScreen";
import { LoginScreen } from "../../../features/auth/screens/LoginScreen";
import { FirstTimeSetupScreen } from "../../../features/auth/screens/FirstTimeSetupScreen";

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  FirstTimeSetup: { uid: string };
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="FirstTimeSetup" component={FirstTimeSetupScreen} />
    </Stack.Navigator>
  );
}

