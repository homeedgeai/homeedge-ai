import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { Camera, useCameraDevice, useCameraPermission } from "react-native-vision-camera";
import { useRouter } from "expo-router";
import * as FileSystem from "expo-file-system";
import DepthCapture from "../../modules/depth-capture"; // your native module wrapper

const API_BASE = process.env.EXPO_PUBLIC_API_BASE ?? "http://192.168.0.14:8000";

export default function ScanRoom() {
  const router = useRouter();
  const { hasPermission, requestPermission } = useCameraPermission();

  // Detect best available camera (back camera)
  const device = useCameraDevice("back", {
    physicalDevices: ["ultra-wide-angle-camera", "wide-angle-camera"],
  });

  const cameraRef = useRef<Camera>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [isLidarAvailable, setIsLidarAvailable] = useState(false);
  const [framesCaptured, setFramesCaptured] = useState(0);
  const [jobId, setJobId] = useState("");

  // ---------- Detect if this device supports LiDAR ----------
  useEffect(() => {
    if (!device) return;
    // VisionCamera flag (true for LiDAR iPhones)
    const canDepth = device.supportsDepthCapture ?? false;

    // Store that
    setIsLidarAvailable(canDepth);
  }, [device]);

  // ---------- Ask for camera permission ----------
  useEffect(() => {
    (async () => {
      if (!hasPermission) {
        await requestPermission();
      }
    })();
  }, [hasPermission]);

  // ---------- START SCAN ----------
  const startScan = async () => {
    if (!device) {
      Alert.alert("Camera unavailable", "Back camera not found.");
      return;
    }

    if (!hasPermission) {
      const ok = await requestPermission();
      if (!ok.granted) return;
    }

    const newJob = `scan_${Date.now()}`;
    setJobId(newJob);
    setFramesCaptured(0);

    setIsScanning(true);

    // LIDAR MODE
    if (isLidarAvailable) {
      Alert.alert("LiDAR Enabled", "Using LiDAR mode for highest accuracy.");
      try {
        await DepthCapture.start(newJob, `${API_BASE}`);
      } catch (e) {
        console.error("LiDAR start failed:", e);
        Alert.alert("LiDAR Error", "Falling back to RGB mode.");
        setIsLidarAvailable(false);
      }
    } else {
      Alert.alert(
        "RGB Mode",
        "This iPhone does not have LiDAR. Using enhanced RGB-only scanning."
      );
    }
  };

  // ---------- STOP SCAN ----------
  const stopScan = async () => {
    setIsScanning(false);

    if (isLidarAvailable) {
      await DepthCapture.stop();
    }

    // navigate to result screen
    router.replace(`/listings/generate?jobId=${jobId}`);
  };

  // ---------- RGB-ONLY FRAME PROCESSOR ----------
  const frameProcessor = useCallback((frame) => {
    "worklet";
    if (!isLidarAvailable) {
      // Encode frame to JPEG via native VisionCamera utilities
      // This uses VisionCamera's built-in frame.toImage APIs or a plugin.
      const jpeg = frame.toJPEG?.();
      if (!jpeg) return;

      runOnJS(sendRGBFrame)(jpeg);
    }
  }, [isLidarAvailable]);

  // ---------- Sends RGB frame to backend ----------
  const sendRGBFrame = async (jpegBuffer) => {
    if (!isScanning || isLidarAvailable) return; // only RGB mode
    try {
      const b64 = Buffer.from(jpegBuffer).toString("base64");
      await fetch(`${API_BASE}/ws/scan/${jobId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frame: b64 }),
      });
      setFramesCaptured((n) => n + 1);
    } catch (e) {
      console.log("RGB frame send failed:", e);
    }
  };

  return (
    <View style={styles.container}>
      {device && (
        <Camera
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={isScanning}
          // Only enable depth if LiDAR available
          enableDepthData={isLidarAvailable}
          frameProcessor={!isLidarAvailable ? frameProcessor : undefined}
          frameProcessorFps={4}
        />
      )}

      <View style={styles.overlay}>
        <Text style={styles.info}>
          {isLidarAvailable ? "LiDAR Mode Active" : "RGB Mode Active"}
        </Text>

        {isScanning ? (
          <TouchableOpacity style={styles.stopBtn} onPress={stopScan}>
            <Text style={styles.stopText}>Stop Scan</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.startBtn} onPress={startScan}>
            <Text style={styles.startText}>Start Scan</Text>
          </TouchableOpacity>
        )}

        {isScanning && (
          <Text style={styles.frames}>{framesCaptured} frames captured</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
  overlay: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    alignItems: "center",
    gap: 10,
  },
  info: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  frames: { color: "white", fontSize: 14 },
  startBtn: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 10,
  },
  startText: { color: "white", fontSize: 18, fontWeight: "600" },
  stopBtn: {
    backgroundColor: "#DC2626",
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 10,
  },
  stopText: { color: "white", fontSize: 18, fontWeight: "600" },
});
