import "react-native-gesture-handler";
import "react-native-reanimated";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View, Text, Alert } from "react-native";

import { Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Firebase
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseConfig";

// Contexts
import { ThemeProvider } from "../src/context/ThemeContext";
import { AppProvider } from "../src/context/AppContext";
import { LeadsProvider } from "../src/context/LeadsContext";
import { ListingsProvider } from "../src/context/ListingsContext";
import { CalendarProvider } from "../src/context/CalendarContext";
import { PerformanceProvider } from "../src/context/PerformanceContext";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<any>(null);

  // 🔥 Firebase Auth Listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (usr) => {
      console.log("🔥 AUTH:", usr ? "Logged In" : "Logged Out");
      setUser(usr);
      setInitializing(false);
    });
    return unsub;
  }, []);

  // 🔥 FIXED AUTH NAVIGATION — NO MORE LOOPS
  useEffect(() => {
    if (initializing) return;
    if (!segments || segments.length === 0) return;

    const current = segments[0];
    const inAuth = current === "login" || current === "signup";
    const inApp = current === "(drawer)";

    // 🚫 NOT LOGGED IN → login
    if (!user) {
      if (!inAuth) router.replace("/login");
      return;
    }

    // 🚫 LOGGED IN but NOT verified
    if (!user.emailVerified) {
      if (!inAuth) {
        Alert.alert("Verify Your Email", "Please check your inbox.");
        router.replace("/login");
      }
      return;
    }

    // ✅ LOGGED IN + VERIFIED → enter app
    if (user.emailVerified && !inApp) {
      router.replace("/(drawer)");
    }
  }, [user, initializing, segments]);

  // Loading screen
  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>
          <AppProvider>
            <LeadsProvider>
              <ListingsProvider>
                <CalendarProvider>
                  <PerformanceProvider>
                    <Stack screenOptions={{ headerShown: false }}>
                      <Stack.Screen name="login" />
                      <Stack.Screen name="signup" />
                      <Stack.Screen name="(drawer)" />
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
