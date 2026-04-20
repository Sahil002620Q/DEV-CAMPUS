import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AdminHomeScreen } from "../../../features/admin/screens/AdminHomeScreen";
import { CafeteriaMenuScreen } from "../../../features/admin/screens/CafeteriaMenuScreen";
import { LibraryScreen } from "../../../features/admin/screens/LibraryScreen";
import { ManageAdminsScreen } from "../../../features/admin/screens/ManageAdminsScreen";
import { useTheme } from "../../providers/ThemeProvider";

export type AdminStackParamList = {
  AdminHome: undefined;
  CafeteriaMenu: undefined;
  Library: undefined;
  ManageAdmins: undefined;
};

const Stack = createNativeStackNavigator<AdminStackParamList>();

export function AdminStack() {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { fontWeight: "700", fontSize: 17 },
        headerShadowVisible: false,
        headerBackTitle: "Back",
      }}
    >
      <Stack.Screen
        name="AdminHome"
        component={AdminHomeScreen}
        options={{ title: "Admin Panel", headerShown: false }}
      />
      <Stack.Screen
        name="CafeteriaMenu"
        component={CafeteriaMenuScreen}
        options={{ title: "Cafeteria Menu" }}
      />
      <Stack.Screen
        name="Library"
        component={LibraryScreen}
        options={{ title: "Library" }}
      />
      <Stack.Screen
        name="ManageAdmins"
        component={ManageAdminsScreen}
        options={{ title: "Manage Admins" }}
      />
    </Stack.Navigator>
  );
}
