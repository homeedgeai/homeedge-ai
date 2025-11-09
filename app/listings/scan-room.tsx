// app/listings/scan-room.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { NativeModules } from "react-native";

const { DepthCapture } = NativeModules;

const BACKEND = "ws://192.168.0.14:8000";

export default function ScanRoomScreen() {
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [frames, setFrames] = useState(0);
  const [status, setStatus] = useState("Ready");

  const jobId = useMemo(() => `job_${Math.random().toString(36).slice(2, 10)}`, []);
  const wsRef = useRef<WebSocket | null>(null);

  // WebSocket for frame count feedback
  useEffect(() => {
    if (!scanning) return;

    const ws = new WebSocket(`${BACKEND}/ws/scan/${jobId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WS connected:", jobId);
      setStatus("Streaming to backend…");
    };

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.frames !== undefined) setFrames(data.frames);
        if (data.status) setStatus(data.status);
      } catch {}
    };

    ws.onerror = (e) => console.log("[WS ERROR]", e);
    ws.onclose = () => {
      console.log("WS closed");
      if (scanning) stopScan(true);
    };

    return () => {
      ws.close();
    };
  }, [scanning, jobId]);

  const startScan = () => {
    if (Platform.OS !== "ios") {
      Alert.alert("Only iOS with LiDAR");
      return;
    }

    if (!DepthCapture) {
      Alert.alert("Native module not linked");
      return;
    }

    setScanning(true);
    setFrames(0);
    setStatus("Starting ARKit…");

    DepthCapture.start(
      jobId,
      `${BACKEND}/ws/scan/${jobId}`,
      () => {
        console.log("DepthCapture STARTED");
        setStatus("Scanning… Move slowly");
      },
      (code: string, message: string) => {
        console.log("DepthCapture ERROR", code, message);
        Alert.alert("ARKit Error", message);
        stopScan();
      }
    );
  };

  const stopScan = (auto = false) => {
    if (!auto) console.log("User stopped scan");
    setScanning(false);
    setStatus("Processing on server…");

    DepthCapture?.stop(
      () => console.log("DepthCapture stopped"),
      (err: any) => console.log("Stop error", err)
    );

    wsRef.current?.close();

    // Navigate after delay
    setTimeout(() => {
      router.push(`/listings/result/${jobId}`);
    }, 3000);
  };

  return (
    <View style={styles.container}>
      {/* BLACK FULLSCREEN — NO CAMERA PREVIEW NEEDED */}
      <View style={StyleSheet.absoluteFill} />

      {/* HUD */}
      <View style={styles.hud}>
        <Text style={styles.title}>
          {scanning ? `${frames} frames • ${status}` : "Hold to Scan Room"}
        </Text>

        <TouchableOpacity
          style={[styles.cta, scanning && styles.ctaStop]}
          onPressIn={startScan}
          onPressOut={() => scanning && stopScan()}
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
          <Text style={styles.warning}>iOS + LiDAR required</Text>
        )}
      </View>
    </View>
  );
}

// ──────────────────────────────────────────────
// STYLES
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