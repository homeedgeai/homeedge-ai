// app/listings/index.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

const BACKEND = "http://192.168.0.14:8000";

export default function ListingsIndex() {
  const router = useRouter();
  const [lastScan, setLastScan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Auto-detect last scan
  useEffect(() => {
    fetch(`${BACKEND}/plan/status?job_id=latest`)
      .then(r => r.json())
      .then(data => {
        if (data.status === "complete") {
          setLastScan(data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const tools = [
    {
      title: "Scan a Room",
      description: "Hold to capture your space in 3D",
      icon: "scan-outline",
      colors: ["#00BCD4", "#009688"],
      route: "/listings/scan-room",
    },
    {
      title: "2D Floorplan",
      description: lastScan ? "Latest scan ready" : "Generate from your scan",
      icon: "grid-outline",
      colors: ["#10B981", "#059669"],
      route: "/listings/floorplan",
      thumbnail: lastScan?.floorplan_url,
    },
    {
      title: "3D Model",
      description: lastScan?.mesh_url ? "Spin • Zoom • AR" : "Available after scan",
      icon: "cube-outline",
      colors: lastScan?.mesh_url ? ["#8B5CF6", "#7C3AED"] : ["#555", "#444"],
      route: lastScan?.mesh_url ? "/listings/floorplan-3d" : null,
      disabled: !lastScan?.mesh_url,
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>HomeEdge AI</Text>
      <Text style={styles.subheader}>
        {lastScan ? "Your space, digitized." : "Tap to scan your first room"}
      </Text>

      {tools.map((tool, i) => (
        <TouchableOpacity
          key={i}
          style={[
            styles.card,
            tool.disabled && styles.cardDisabled,
          ]}
          activeOpacity={tool.disabled ? 1 : 0.85}
          onPress={() => {
            if (tool.disabled) {
              Alert.alert("No 3D yet", "Scan a room first!");
              return;
            }
            router.push(tool.route!);
          }}
        >
          <LinearGradient
            colors={tool.colors}
            style={[
              styles.iconCircle,
              tool.disabled && styles.iconCircleDisabled,
            ]}
          >
            <Ionicons name={tool.icon as any} size={28} color="#fff" />
          </LinearGradient>

          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{tool.title}</Text>
            <Text style={styles.cardDesc}>{tool.description}</Text>
          </View>

          {tool.thumbnail ? (
            <Image
              source={{ uri: tool.thumbnail }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          ) : (
            <Ionicons
              name="chevron-forward"
              size={22}
              color={tool.disabled ? "#444" : "#aaa"}
            />
          )}
        </TouchableOpacity>
      ))}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          v1.0 • Built by a fucking legend
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", padding: 24 },
  header: {
    color: "#00ffcc",
    fontSize: 32,
    fontWeight: "900",
    marginBottom: 6,
    textAlign: "center",
    letterSpacing: 1,
  },
  subheader: {
    color: "#bbb",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
    fontWeight: "500",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111",
    borderRadius: 24,
    padding: 20,
    marginBottom: 18,
    shadowColor: "#00ffcc",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  cardDisabled: {
    opacity: 0.6,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 18,
  },
  iconCircleDisabled: {
    opacity: 0.7,
  },
  cardTitle: { color: "#fff", fontSize: 19, fontWeight: "700" },
  cardDesc: { color: "#aaa", fontSize: 14, marginTop: 4 },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#00ffcc",
  },
  footer: { alignItems: "center", marginTop: 40, opacity: 0.6 },
  footerText: { color: "#888", fontSize: 13, fontWeight: "600" },
});