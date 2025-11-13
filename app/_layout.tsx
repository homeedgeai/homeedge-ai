import "react-native-gesture-handler";
import "react-native-reanimated";
import React, { useEffect, useState, useRef } from "react";
import {
  ActivityIndicator,
  View,
  Text,
  Alert,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
} from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { enableNetwork, disableNetwork } from "firebase/firestore";
import NetInfo from "@react-native-community/netinfo";

// Context Providers
import { ThemeProvider } from "../src/context/ThemeContext";
import { AppProvider } from "../src/context/AppContext";
import { LeadsProvider } from "../src/context/LeadsContext";
import { ListingsProvider } from "../src/context/ListingsContext";
import { CalendarProvider } from "../src/context/CalendarContext";
import { PerformanceProvider } from "../src/context/PerformanceContext";

export default function RootLayout() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const segments = useSegments();

  // 🔌 Offline state
  const [offline, setOffline] = useState(false);
  const [offlineSince, setOfflineSince] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const retryInterval = useRef<NodeJS.Timeout | null>(null);

  // ✅ Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (usr) => {
      console.log("🔥 Firebase Auth:", usr ? "Logged In" : "Logged Out");
      setUser(usr);
      setInitializing(false);
    });
    return unsub;
  }, []);

  // ✅ Force Firestore network on startup
  useEffect(() => {
    (async () => {
      try {
        await enableNetwork(db);
        console.log("✅ Firestore network re-enabled");
      } catch (err) {
        console.warn("⚠️ Firestore network already active or failed:", err);
      }
    })();
  }, []);

  // ⚡ Detect connection changes + manage retry logic
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(async (state) => {
      const isOffline = !(state.isConnected && state.isInternetReachable);
      setOffline(isOffline);

      if (isOffline) {
        await disableNetwork(db);
        setOfflineSince(new Date().toLocaleTimeString());
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }).start();

        // Start periodic retry
        if (!retryInterval.current) {
          retryInterval.current = setInterval(() => {
            console.log("🔁 Attempting reconnect...");
            handleRetry();
          }, 8000); // every 8s
        }
      } else {
        await enableNetwork(db);
        clearInterval(retryInterval.current as NodeJS.Timeout);
        retryInterval.current = null;
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start();
      }
    });
    return () => {
      unsubscribe();
      if (retryInterval.current) clearInterval(retryInterval.current);
    };
  }, []);

  // 🔁 Manual retry handler
  const handleRetry = async () => {
    if (retrying) return;
    setRetrying(true);
    try {
      await enableNetwork(db);
      const state = await NetInfo.fetch();
      if (state.isConnected && state.isInternetReachable) {
        setOffline(false);
        clearInterval(retryInterval.current as NodeJS.Timeout);
        retryInterval.current = null;
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
        console.log("✅ Reconnected successfully");
      } else {
        console.log("❌ Still offline");
      }
    } catch (e) {
      console.log("Retry failed:", e);
    } finally {
      setRetrying(false);
    }
  };

  // 🚦 Auth routing
  useEffect(() => {
    if (initializing) return;
    const inDrawer = segments[0] === "(drawer)";
    if (user) {
      if (!user.emailVerified) {
        Alert.alert("Email Not Verified", "Please verify your email before continuing.");
        router.replace("/login");
      } else if (!inDrawer) {
        router.replace("/(drawer)");
      }
    } else if (inDrawer) {
      router.replace("/login");
    }
  }, [user, initializing, segments]);

  // 🌀 Loading UI
  if (initializing) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingTxt}>Checking your account…</Text>
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
                    {/* 🚨 Smart Offline Banner */}
                    <Animated.View
                      style={[
                        styles.offlineBanner,
                        {
                          opacity: fadeAnim,
                          transform: [
                            {
                              translateY: fadeAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [-50, 0],
                              }),
                            },
                          ],
                        },
                      ]}
                    >
                      <Text style={styles.offlineText}>
                        ⚠️ Offline Mode{" "}
                        {offlineSince ? `(since ${offlineSince})` : ""}
                      </Text>
                      <TouchableOpacity
                        onPress={handleRetry}
                        style={styles.retryBtn}
                        disabled={retrying}
                      >
                        <Text style={styles.retryTxt}>
                          {retrying ? "Retrying..." : "Tap to Retry"}
                        </Text>
                      </TouchableOpacity>
                    </Animated.View>

                    {/* App Navigator */}
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

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
  },
  loadingTxt: { color: "#374151", marginTop: 10 },
  offlineBanner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#DC2626",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 6,
    zIndex: 999,
    elevation: 10,
  },
  offlineText: { color: "#fff", fontWeight: "700" },
  retryBtn: {
    marginTop: 4,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  retryTxt: { color: "#fff", fontWeight: "600", fontSize: 12 },
});
