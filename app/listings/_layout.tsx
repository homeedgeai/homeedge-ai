import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

// Screens
import GenerateListingScreen from "./generate";
import FloorplanScreen from "./floorplan";
import HouseRenderScreen from "./house-render";
// import ScanRoom_ARKit from "./ScanRoom_ARKit"; // ❌ Disabled native-only version
import FloorplanViewer from "./floorplan-viewer"; // ✅ Viewer tab

const Tab = createBottomTabNavigator();

export default function ListingsStack() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#3B82F6",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 0.5,
          borderColor: "#E5E7EB",
          height: 70,
          paddingBottom: 10,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "home-outline";
          if (route.name === "Generate") iconName = "create-outline";
          else if (route.name === "Floorplan") iconName = "grid-outline";
          else if (route.name === "Render") iconName = "home-outline";
          else if (route.name === "Scan") iconName = "camera-outline";
          else if (route.name === "Viewer") iconName = "map-outline";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Generate" component={GenerateListingScreen} />
      <Tab.Screen name="Floorplan" component={FloorplanScreen} />
      <Tab.Screen name="Render" component={HouseRenderScreen} />

      {/* ❌ Temporarily disable native-only ARKit screen */}
      {/* <Tab.Screen
        name="Scan"
        component={ScanRoom_ARKit}
        options={{ title: "Scan Room" }}
      /> */}

      {/* ✅ Use viewer or placeholder until bare workflow */}
      <Tab.Screen
        name="Viewer"
        component={FloorplanViewer}
        options={{ title: "Viewer" }}
      />
    </Tab.Navigator>
  );
}
