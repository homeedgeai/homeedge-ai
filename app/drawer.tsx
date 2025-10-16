// app/drawer.tsx
import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import DashboardScreen from "./(tabs)/index";
import MapScreen from "./(tabs)/map";
import CalendarScreen from "./(tabs)/calendar";
import NotificationsScreen from "./(tabs)/notifications";
import SettingsScreen from "./(tabs)/settings";

const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

// 👇 Bottom Tabs inside Drawer
function TabNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator screenOptions={{ headerShown: false }}>
      <Drawer.Screen name="Home" component={TabNavigator} />
    </Drawer.Navigator>
  );
}
