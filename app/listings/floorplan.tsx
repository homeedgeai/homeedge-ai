import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Share,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

const API = "http://192.168.0.14:8000";

export default function Floorplan() {
  const router = useRouter();
  const { jobId } = useLocalSearchParams<{ jobId?: string }>();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!jobId) return;

    const tick = async () => {
      try {
        const r = await fetch(`${API}/plan/status?job_id=${jobId}`);
        const j = await r.json();

        if (j.status === "complete") {
          setData(j);
          setLoading(false);
        } else {
          setTimeout(tick, 1200);
        }
      } catch (err) {
        // Retry on failure
        setTimeout(tick, 1800);
      }
    };

    tick();
  }, [jobId]);

  const handle3D = () => {
    if (!data?.mesh_url) {
      Alert.alert("3D not available", "Add depth capture to enable 3D.");
      return;
    }

    router.push({
      pathname: "/listings/floorplan-3d",
      params: { mesh_url: data.mesh_url },
    });
  };

  const handleShare = async () => {
    if (!data?.floorplan_url) return;

    try {
      await Share.share({
        url: data.floorplan_url,
        message: "My AI floorplan (HomeEdge)",
        title: "Home scan",
      });
    } catch {}
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00ffcc" />
        <Text style={styles.loading}>Building your floorplan…</Text>
      </View>
    );
  }

  // Extra safety: avoid broken API cases
  const imgUrl =
    data?.floorplan_url ||
    "https://dummyimage.com/600x400/111/fff.png&text=No+Floorplan";

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Image
          source={{ uri: imgUrl }}
          style={styles.image}
          resizeMode="contain"
        />

        <Text style={styles.caption}>AI-Generated Floorplan</Text>
      </ScrollView>

      <View style={styles.bottom}>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => router.push("/listings/scan-room")}
        >
          <Ionicons name="camera" size={24} color="#000" />
          <Text style={styles.btnText}>Rescan</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btn} onPress={handle3D}>
          <Ionicons name="cube" size={24} color="#000" />
          <Text style={styles.btnText}>View 3D</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btn} onPress={handleShare}>
          <Ionicons name="share-social" size={24} color="#000" />
          <Text style={styles.btnText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  loading: { color: "#9ff", marginTop: 12, fontWeight: "700" },
  scroll: { alignItems: "center", padding: 16 },
  image: {
    width: "100%",
    height: 620,
    backgroundColor: "#111",
    borderRadius: 16,
  },
  caption: { color: "#9ff", marginTop: 14, fontWeight: "800", fontSize: 18 },

  bottom: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 16,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 22,
    elevation: 3,
  },
  btnText: { fontWeight: "800" },
});
