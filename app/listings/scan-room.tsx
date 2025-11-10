// app/listings/scan-room.tsx
import React, { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import DepthCapture from "@/modules/depth-capture";

const BACKEND_WS = "ws://192.168.0.14:8000";

export default function ScanRoomScreen() {
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [frames, setFrames] = useState(0);
  const [status, setStatus] = useState("Ready");
  const wsRef = useRef<WebSocket | null>(null);
  const jobId = useMemo(() => `job_${Math.random().toString(36).slice(2, 10)}`, []);

  const startScan = async () => {
    if (Platform.OS !== "ios") {
      Alert.alert("Unsupported", "Depth scanning requires an iPhone with LiDAR.");
      return;
    }

    try {
      setScanning(true);
      setStatus("Initializing ARKit...");
      setFrames(0);

      // Start native ARKit stream
      await DepthCapture.start(jobId, BACKEND_WS);
      setStatus("Streaming depth data...");
      console.log("[DepthCapture] Started:", jobId);

      // Optional WebSocket feedback (if your backend sends progress)
      const ws = new WebSocket(`${BACKEND_WS}/ws/scan/${jobId}`);
      wsRef.current = ws;

      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.progress !== undefined) setFrames(data.progress);
          if (data.status) setStatus(data.status);
        } catch {}
      };
      ws.onerror = (err) => console.warn("WS error:", err.message);
      ws.onclose = () => console.log("WS closed");

    } catch (err: any) {
      console.error("[DepthCapture] Error:", err);
      Alert.alert("ARKit Error", err.message || "Unable to start depth capture");
      stopScan();
    }
  };

  const stopScan = async () => {
    console.log("[DepthCapture] Stopping...");
    await DepthCapture.stop();
    wsRef.current?.close();
    setScanning(false);
    setStatus("Processing...");

    // Navigate to result screen after delay
    setTimeout(() => {
      router.push({
        pathname: "/listings/result",
        params: { jobId },
      });
    }, 2500);
  };

  return (
    <View style={styles.container}>
      <View style={StyleSheet.absoluteFill} />
      <View style={styles.hud}>
        <Text style={styles.title}>
          {scanning
            ? `${frames} frames • ${status}`
            : "Hold to Scan Room"}
        </Text>

        <TouchableOpacity
          style={[styles.cta, scanning && styles.ctaStop]}
          onPressIn={startScan}
          onPressOut={stopScan}
          disabled={Platform.OS !== "ios"}
        >
          <Ionicons
            name={scanning ? "square" : "radio-button-on"}
            size={28}
            color="#fff"
          />
          <Text style={styles.ctaText}>
            {scanning ? "Release to Stop" : "Hold to Start"}
          </Text>
        </TouchableOpacity>

        {!scanning && Platform.OS !== "ios" && (
          <Text style={styles.warning}>Requires iPhone with LiDAR</Text>
        )}
      </View>
    </View>
  );
}

// ──────────────────────────────────────────────
// Styles
// ──────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  hud: {
    position: "absolute",
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 20,
    textAlign: "center",
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#0a84ff",
    borderRadius: 32,
    paddingHorizontal: 28,
    paddingVertical: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  ctaStop: {
    backgroundColor: "#ff3b30",
  },
  ctaText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 18,
  },
  warning: {
    color: "#ff453a",
    marginTop: 16,
    fontWeight: "600",
  },
});
