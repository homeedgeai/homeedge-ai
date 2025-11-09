// 🚨 These MUST be first
import "react-native-gesture-handler";
import "react-native-reanimated";

import React from "react";
import { Stack, router } from "expo-router"; // ⬅️ import router for shim
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { ThemeProvider } from "../src/context/ThemeContext";
import { AppProvider } from "../src/context/AppContext";
import { LeadsProvider } from "../src/context/LeadsContext";
import { ListingsProvider } from "../src/context/ListingsContext";
import { CalendarProvider } from "../src/context/CalendarContext";
import { PerformanceProvider } from "../src/context/PerformanceContext";

// 🧩 Optional fix for AbortController (iOS bundling)
try {
  const { AbortController, AbortSignal } = require("abort-controller");
  if (!global.AbortController) global.AbortController = AbortController;
  if (!global.AbortSignal) global.AbortSignal = AbortSignal;
} catch {}

// 🩹 Defensive shim for Expo Router hydration bug
if (router) {
  const safe = (fnName: string) => {
    if (typeof (router as any)[fnName] !== "function") {
      (router as any)[fnName] = (...args: any[]) => {
        console.warn(
          `⚠️ router.${fnName}() called before navigation ready — ignored`,
          args
        );
      };
    }
  };
  ["back", "push", "replace", "navigate", "prefetch"].forEach(safe);
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>
          <AppProvider>
            <LeadsProvider>
              <ListingsProvider>
                <CalendarProvider>
                  <PerformanceProvider>
                    {/* ✅ Root-level Stack defines top-level routes */}
                    <Stack screenOptions={{ headerShown: false }}>
                      {/* Home or dashboard */}
                      <Stack.Screen name="index" />

                      {/* Tab navigation group */}
                      <Stack.Screen name="(tabs)" />

                      {/* ✅ Nested /listings stack (uses its own _layout.tsx) */}
                      <Stack.Screen
                        name="listings"
                        options={{
                          headerShown: false,
                          animation: "fade",
                        }}
                      />
                    </Stack>
                  </PerformanceProvider>
                </CalendarProvider>
              </ListingsProvider>
            </LeadsProvider>
          </AppProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
