// app/listings/_layout.tsx
import React from "react";
import { Stack } from "expo-router";

export default function ListingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: "#000" },
        gestureEnabled: true,
        gestureDirection: "horizontal",
      }}
    >
      {/* MAIN SCREENS */}
      <Stack.Screen name="index" options={{ title: "Listings" }} />
      <Stack.Screen name="scan-room" options={{ title: "Scan Room" }} />
      <Stack.Screen name="floorplan" options={{ title: "Your Floorplan" }} />
      <Stack.Screen name="floorplan-3d" options={{ title: "3D Model" }} />
      
      {/* LEGACY / FUTURE — KEEP BUT HIDE FROM BACK STACK */}
      <Stack.Screen 
        name="generate" 
        options={{ presentation: "modal", headerShown: false }} 
      />
      <Stack.Screen 
        name="house-render" 
        options={{ title: "3D Render", presentation: "fullScreenModal" }} 
      />

      {/* CLEANUP — remove unused */}
      {/* <Stack.Screen name="router-test" /> */}
    </Stack>
  );
}