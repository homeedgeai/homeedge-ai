import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function DashboardScreen() {
  const router = useRouter();
  const [agentName, setAgentName] = useState("Agent");
  const [profileUri, setProfileUri] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const user = await AsyncStorage.getItem("ohai:user");
      if (!user) return;
      try {
        const parsed = JSON.parse(user);
        setAgentName(parsed.name || "Agent");
      } catch {
        setAgentName("Agent");
      }

      const p = await AsyncStorage.getItem("ohai:profile");
      if (p) {
        try {
          const parsedProfile = JSON.parse(p);
          if (parsedProfile.avatar) setProfileUri(parsedProfile.avatar);
        } catch {}
      }
    })();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("ohai:user");
    Alert.alert("Logged out", "You’ve been signed out.");
    router.replace("/login");
  };

  return (
    <View style={styles.container}>
      {/* 🌅 Background */}
      <LinearGradient
        colors={["#000000", "#15140E", "#D4AF37"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView style={styles.scroll}>
        {/* Header */}
        <View style={styles.headerGlass}>
          <View style={styles.headerInner}>
            <View>
              <Text style={styles.welcome}>Welcome back, {agentName} 👋</Text>
              <Text style={styles.subtitle}>Here’s your daily overview</Text>
            </View>

            {/* Avatar + Logout */}
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TouchableOpacity onPress={() => router.push("/(drawer)/settings")}>
                <Image
                  source={
                    profileUri
                      ? { uri: profileUri }
                      : require("../../assets/images/profile.png")
                  }
                  style={styles.avatar}
                />
              </TouchableOpacity>

              <TouchableOpacity onPress={handleLogout} style={{ marginLeft: 10 }}>
                <Ionicons name="log-out-outline" size={26} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { icon: "eye-outline", title: "Views", value: "2.3K", color: "#2563EB" },
            { icon: "people-outline", title: "Leads", value: "187", color: "#16A34A" },
            { icon: "home-outline", title: "Listings", value: "24", color: "#EAB308" },
          ].map((item, i) => (
            <View key={i} style={styles.statCard}>
              <Ionicons name={item.icon as any} size={22} color={item.color} />
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        {/* Quick Access */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.quickRow}>
            <TouchableOpacity
              style={styles.quickButton}
              onPress={() => router.push("/(drawer)/listings")}
            >
              <Ionicons name="briefcase-outline" size={26} color="#2563EB" />
              <Text style={styles.quickText}>Listings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickButton}
              onPress={() => router.push("/(drawer)/calendar")}
            >
              <Ionicons name="calendar-outline" size={26} color="#16A34A" />
              <Text style={styles.quickText}>Calendar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickButton}
              onPress={() => router.push("/(drawer)/performance")}
            >
              <Ionicons name="trending-up-outline" size={26} color="#EAB308" />
              <Text style={styles.quickText}>Performance</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Smart Map Button */}
      <TouchableOpacity
        style={styles.mapFab}
        onPress={() => router.push("/(drawer)/map")}
      >
        <Ionicons name="map-outline" size={28} color="#FFD700" />
        <Text style={styles.mapText}>Smart Map</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  headerGlass: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerInner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcome: { fontSize: 22, fontWeight: "700", color: "#fff" },
  subtitle: { fontSize: 14, color: "#ccc", marginTop: 4 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.4)",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 20,
  },
  statCard: {
    width: 110,
    height: 100,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,215,0,0.2)",
    borderWidth: 1,
  },
  cardTitle: { fontSize: 13, color: "#ddd", marginTop: 6 },
  cardValue: { fontSize: 18, fontWeight: "700", color: "#fff" },
  section: { marginHorizontal: 20, marginTop: 10 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#fff" },
  quickRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  quickButton: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: "center",
    marginHorizontal: 4,
    borderColor: "rgba(255,215,0,0.2)",
    borderWidth: 1,
  },
  quickText: { marginTop: 6, fontWeight: "500", color: "#fff" },
  mapFab: {
    position: "absolute",
    bottom: 30,
    right: 25,
    backgroundColor: "rgba(0,0,0,0.65)",
    borderRadius: 40,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  mapText: {
    color: "#FFD700",
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 6,
  },
});
