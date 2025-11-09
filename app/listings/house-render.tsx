import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  CameraView,
  useCameraPermissions,
  useMicrophonePermissions,
} from "expo-camera";
import { useRouter } from "expo-router";

const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL?.replace(/\/$/, "") ||
  "http://192.168.0.3:8000";

export default function ScanRoom() {
  const router = useRouter();

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();
  const [cameraActive, setCameraActive] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [status, setStatus] = useState("Idle");

  const cameraRef = useRef<CameraView | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.push("/listings");
  };

  const startRecording = async () => {
    if (!cameraRef.current || !isReady || isRecording || isBusy) return;

    setIsRecording(true);
    setStatus("Recording…");

    try {
      const video = await cameraRef.current.recordAsync({
        quality: "1080p",
      });
      setIsRecording(false);
      if (video?.uri) await uploadVideo(video.uri);
    } catch (err: any) {
      console.error("Recording error:", err);
      setIsRecording(false);
      Alert.alert("Recording failed", err.message || "Try again.");
    }
  };

  const stopRecording = () => {
    cameraRef.current?.stopRecording();
  };

  const uploadVideo = async (uri: string) => {
    try {
      setIsBusy(true);
      setStatus("Uploading…");

      const form = new FormData();
      form.append("file", {
        uri,
        type: "video/mp4",
        name: "scan.mp4",
      } as any);

      const res = await fetch(`${BACKEND_URL}/plan/upload`, {
        method: "POST",
        body: form,
      });
      const json = await res.json();
      beginPolling(json.job_id);
    } catch (e) {
      console.error("Upload failed:", e);
      setIsBusy(false);
      Alert.alert("Upload failed", "Check your connection.");
    }
  };

  const beginPolling = (id: string) => {
    const poll = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/plan/status?job_id=${id}`);
        const data = await res.json();
        if (data.progress != null) setProgress(Math.round(data.progress));
        if (data.status === "complete" && data.floorplan_url) {
          clearInterval(pollRef.current!);
          setIsBusy(false);
          router.push({ pathname: "/listings/floorplan", params: { jobId: id } });
        }
      } catch (e) {
        console.warn("Poll failed:", e);
      }
    };
    pollRef.current = setInterval(poll, 3000);
  };

  // Loading permissions
  if (!cameraPermission || !micPermission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00ffcc" />
        <Text style={styles.text}>Loading permissions…</Text>
      </View>
    );
  }

  // Permissions denied
  if (!cameraPermission.granted || !micPermission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>
          Camera + Microphone required for scanning.
        </Text>
        {!cameraPermission.granted && (
          <TouchableOpacity style={styles.startButton} onPress={requestCameraPermission}>
            <Text style={styles.startText}>Allow Camera</Text>
          </TouchableOpacity>
        )}
        {!micPermission.granted && (
          <TouchableOpacity style={styles.startButton} onPress={requestMicPermission}>
            <Text style={styles.startText}>Allow Microphone</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (!cameraActive) {
    return (
      <View style={styles.center}>
        <Ionicons name="scan-outline" size={64} color="#00ffcc" />
        <Text style={styles.title}>Room Scan</Text>
        <TouchableOpacity style={styles.startButton} onPress={() => setCameraActive(true)}>
          <Text style={styles.startText}>Start Scan</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleBack} style={styles.cancelButton}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        onCameraReady={() => setIsReady(true)}
      />

      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Ionicons name="chevron-back" size={24} color="#fff" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      {isBusy && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#00ffcc" />
          <Text style={styles.overlayText}>{status}</Text>
          {progress != null && <Text style={styles.overlayText}>{progress}%</Text>}
        </View>
      )}

      <View style={styles.controls}>
        <TouchableOpacity
          onLongPress={startRecording}
          onPressOut={stopRecording}
          disabled={!isReady || isBusy}
          style={[styles.recordButton, (!isReady || isBusy) && { opacity: 0.4 }]}
        >
          <Ionicons
            name={isRecording ? "square" : "ellipse"}
            size={58}
            color={isRecording ? "red" : "white"}
          />
        </TouchableOpacity>
        <Text style={styles.statusText}>
          {isRecording ? "Recording…" : isBusy ? status : "Hold to Record"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  camera: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" },
  text: { color: "#fff", fontSize: 16, textAlign: "center", marginHorizontal: 40, marginBottom: 20 },
  title: { color: "#fff", fontSize: 28, fontWeight: "700", marginTop: 12 },
  startButton: {
    backgroundColor: "#00ffcc",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginTop: 10,
  },
  startText: { color: "#000", fontWeight: "700", fontSize: 18 },
  cancelButton: { marginTop: 20 },
  cancelText: { color: "#888" },
  backButton: {
    position: "absolute",
    top: 58,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    zIndex: 10,
  },
  backText: { color: "#fff", marginLeft: 6, fontWeight: "600" },
  controls: { position: "absolute", bottom: 60, alignSelf: "center", alignItems: "center" },
  recordButton: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  statusText: { marginTop: 10, color: "#fff", fontSize: 16 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  overlayText: { color: "#00ffcc", fontSize: 18, marginTop: 8 },
});