import React from "react";
import { Drawer } from "expo-router/drawer";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Platform } from "react-native";

export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={{
        drawerContentStyle: {
          marginTop: Platform.OS === "ios" ? 60 : 30,
          borderTopLeftRadius: 24,
          borderBottomLeftRadius: 24,
          backgroundColor: "#F8F8F8",
        },
        drawerItemStyle: { borderRadius: 12, marginVertical: 4 },
        drawerLabelStyle: { fontSize: 16, fontWeight: "500", marginLeft: -4 },
        drawerActiveTintColor: "#000",
        drawerInactiveTintColor: "#6D6D6D",
        drawerActiveBackgroundColor: "#E9E9E9",
        headerStyle: { backgroundColor: "#FFFFFF" },
        headerTintColor: "#000",
        useLegacyImplementation: true, // 🧩 fixes Reanimated crash
        drawerType: Platform.OS === "ios" ? "front" : "slide",
        overlayColor: "rgba(0,0,0,0.15)",
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          title: "Dashboard",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="listings"
        options={{
          title: "Listings",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="briefcase-outline" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="calendar"
        options={{
          title: "Calendar",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="performance"
        options={{
          title: "Performance",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="trending-up-outline" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="settings"
        options={{
          title: "Settings",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="map"
        options={{
          title: "Smart Map",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="map-outline" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="gallery"
        options={{
          title: "Gallery",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="images-outline" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="manage-subscription"
        options={{
          title: "Manage Subscription",
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="credit-card-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Drawer>
  );
}
