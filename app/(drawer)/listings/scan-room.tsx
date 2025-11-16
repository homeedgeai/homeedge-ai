// app/listings/scan-room.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// 🔹 This automatically uses native @openhouse/depth if it exists,
//    or the JS fallback stub if native isn't available.
//    (Never crashes, no breaking)
import DepthCapture from "@openhouse/depth";

export default function ScanRoomScreen() {
  const router = useRouter();

  const handleBackToListings = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(drawer)");
    }
  };

  const handleStartScan = async () => {
    // 🔸 Safe. On TestFlight/dev this returns "unsupported"
    //     After the native module is added, it will start RoomPlan.
    const status = await DepthCapture.start("demo-job", "https://example");

    console.log("[ScanRoom] DepthCapture status:", status);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackToListings} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.title}>Scan a Room</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Ionicons name="cube-outline" size={32} color="#2563EB" />
          </View>

          <Text style={styles.cardTitle}>
            {Platform.OS === "ios"
              ? "LiDAR scan unavailable in this build"
              : "Room scanning requires iOS"}
          </Text>

          <Text style={styles.cardBody}>
            The full LiDAR / RoomPlan capture feature needs a custom iOS native
            module. This build is running in{" "}
            <Text style={styles.bold}>safe mode</Text>, so all scan actions are
            disabled to avoid crashes.
          </Text>

          <Text style={styles.cardBody}>
            Once the native module is added, this screen will launch the
            full 3D scanning interface with no UI changes needed.
          </Text>

          <TouchableOpacity style={styles.primaryBtn} onPress={handleStartScan}>
            <Ionicons name="scan-outline" size={18} color="#FFFFFF" />
            <Text style={styles.primaryText}>Try Scan (Safe Stub)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: "#111827", marginTop: 12 }]}
            onPress={handleBackToListings}
          >
            <Ionicons name="home-outline" size={18} color="#FFFFFF" />
            <Text style={styles.primaryText}>Back to Listings</Text>
          </TouchableOpacity>

          <View style={styles.platformNote}>
            <Text style={styles.platformText}>
              Platform: {Platform.OS === "ios" ? "iOS" : Platform.OS.toUpperCase()}
              {"  •  "}
              Depth Module: <Text style={styles.bold}>stub active</Text>
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
  },
  card: {
    flex: 1,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  cardBody: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
    marginBottom: 8,
  },
  bold: {
    fontWeight: "600",
    color: "#111827",
  },
  primaryBtn: {
    marginTop: 8,
    height: 48,
    borderRadius: 999,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  primaryText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  platformNote: {
    marginTop: 12,
    alignItems: "center",
  },
  platformText: {
    fontSize: 12,
    color: "#6B7280",
  },
});
