import React, { useMemo } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text } from "react-native";
import { HomeScreen } from "../../../features/home/screens/HomeScreen";
import { ExploreScreen } from "../../../features/explore/screens/ExploreScreen";
import { InboxScreen } from "../../../features/inbox/screens/InboxScreen";
import { ProfileScreen } from "../../../features/profile/screens/ProfileScreen";
import { PostLauncher } from "../../../features/post/screens/PostLauncher";
import { AdminStack } from "../admin/AdminStack";
import { useTheme } from "../../providers/ThemeProvider";
import { useRole } from "../../providers/RoleProvider";

export type AppTabsParamList = {
  Home: undefined;
  Explore: undefined;
  Post: undefined;
  Inbox: undefined;
  Profile: undefined;
  Admin: undefined;
};

const Tab = createBottomTabNavigator<AppTabsParamList>();

export function AppTabs() {
  const { theme } = useTheme();
  const { isAdmin } = useRole();

  const screenOptions = useMemo(
    () => ({
      headerShown: false,
      tabBarShowLabel: true,
      tabBarStyle: {
        backgroundColor: theme.colors.surface,
        borderTopColor: theme.colors.border,
      },
      tabBarActiveTintColor: theme.colors.accent,
      tabBarInactiveTintColor: theme.colors.muted,
    }),
    [theme]
  );

  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen
        name="Post"
        component={PostLauncher}
        options={{
          tabBarLabel: "",
          tabBarIcon: ({ color }) => (
            <View
              style={{
                height: 44,
                width: 44,
                borderRadius: 22,
                backgroundColor: theme.colors.accent,
                opacity: color === theme.colors.muted ? 0.8 : 1,
              }}
            />
          ),
        }}
      />
      <Tab.Screen name="Inbox" component={InboxScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      {isAdmin && (
        <Tab.Screen
          name="Admin"
          component={AdminStack}
          options={{
            tabBarLabel: "Admin",
            tabBarIcon: ({ color, focused }) => (
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  backgroundColor: focused ? theme.colors.accent + "33" : "transparent",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 16 }}>⚙️</Text>
              </View>
            ),
          }}
        />
      )}
    </Tab.Navigator>
  );
}
