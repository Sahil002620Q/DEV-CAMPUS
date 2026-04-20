import "react-native-gesture-handler";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { RootNavigator } from "./navigation/RootNavigator";
import { AuthProvider } from "./providers/AuthProvider";
import { ThemeProvider } from "./providers/ThemeProvider";
import { RoleProvider } from "./providers/RoleProvider";

export function AppRoot() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RoleProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </RoleProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
