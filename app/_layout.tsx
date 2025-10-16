// app/_layout.tsx
import "react-native-url-polyfill/auto";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator } from "@react-navigation/drawer";

// ✅ Context Providers
import { AppProvider } from "../src/context/AppContext";
import { ListingsProvider } from "../src/context/ListingsContext";
import { CalendarProvider } from "../src/context/CalendarContext";
import { LeadsProvider } from "../src/context/LeadsContext";
import { PerformanceProvider } from "../src/context/PerformanceContext";

// ✅ Core Screens
import DashboardScreen from "./(tabs)/index";
import ListingsStack from "./listings/_layout";
import MapScreen from "./(tabs)/map";
import CalendarScreen from "./(tabs)/calendar";

// ✅ Drawer Extras
import InboxScreen from "./(tabs)/inbox";
import TeamsStack from "./(tabs)/teams/_layout";
import NotificationsScreen from "./(tabs)/notifications";
import SettingsScreen from "./(tabs)/settings";

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// ✅ Bottom Tabs (core 4 only)
function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#3B82F6",
        tabBarInactiveTintColor: "#6b7280",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 0,
          elevation: 5,
          height: 60,
          paddingBottom: 5,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "ellipse-outline";
          switch (route.name) {
            case "Dashboard":
              iconName = "home-outline";
              break;
            case "Listings":
              iconName = "business-outline";
              break;
            case "Map":
              iconName = "map-outline";
              break;
            case "Calendar":
              iconName = "calendar-outline";
              break;
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Listings" component={ListingsStack} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
    </Tab.Navigator>
  );
}

// ✅ Drawer wraps Tabs + extras
export default function RootLayout() {
  return (
    <AppProvider>
      <ListingsProvider>
        <CalendarProvider>
          <LeadsProvider>
            <PerformanceProvider>
              <Drawer.Navigator
                screenOptions={{
                  headerShown: false,
                  drawerActiveTintColor: "#fff",
                  drawerActiveBackgroundColor: "#3B82F6",
                }}
              >
                <Drawer.Screen
                  name="Main"
                  component={MainTabs}
                  options={{ drawerLabel: "Home" }}
                />
                <Drawer.Screen name="Inbox" component={InboxScreen} />
                <Drawer.Screen name="Teams" component={TeamsStack} />
                <Drawer.Screen name="Notifications" component={NotificationsScreen} />
                <Drawer.Screen name="Settings" component={SettingsScreen} />
              </Drawer.Navigator>
            </PerformanceProvider>
          </LeadsProvider>
        </CalendarProvider>
      </ListingsProvider>
    </AppProvider>
  );
}
