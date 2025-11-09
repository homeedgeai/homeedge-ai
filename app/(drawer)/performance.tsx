import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { getAnalytics } from "../../utils/analytics";

export default function PerformanceScreen() {
  const [stats, setStats] = useState({ views: 0, leads: 0, listings: 0, updatedAt: "" });
  const [fadeAnim] = useState(new Animated.Value(0));

  const load = async () => {
    const data = await getAnalytics();
    setStats(data);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <LinearGradient colors={["#0D0D0D", "#1C1C1E", "#2C2C2E"]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Performance</Text>

        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Metrics Row */}
          <View style={styles.row}>
            <MetricCard
              icon="eye-outline"
              label="Views"
              value={stats.views}
              color="#0A84FF"
              gradient={["#007AFF", "#0A84FF"]}
            />
            <MetricCard
              icon="people-outline"
              label="Leads"
              value={stats.leads}
              color="#34C759"
              gradient={["#34C759", "#30D158"]}
            />
          </View>

          <View style={styles.row}>
            <MetricCard
              icon="home-outline"
              label="Listings"
              value={stats.listings}
              color="#FFD60A"
              gradient={["#FFD60A", "#FFCC00"]}
            />
            <MetricCard
              icon="trending-up-outline"
              label="Growth"
              value={`${(stats.views + stats.leads) / 10}%`}
              color="#FF375F"
              gradient={["#FF2D55", "#FF375F"]}
            />
          </View>

          {/* Refresh */}
          <TouchableOpacity style={styles.refreshBtn} onPress={load}>
            <Ionicons name="refresh-outline" size={18} color="#fff" />
            <Text style={styles.refreshText}>Refresh</Text>
          </TouchableOpacity>

          <Text style={styles.timestamp}>
            Updated {new Date(stats.updatedAt || Date.now()).toLocaleString()}
          </Text>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

function MetricCard({
  icon,
  label,
  value,
  color,
  gradient,
}: {
  icon: any;
  label: string;
  value: any;
  color: string;
  gradient: string[];
}) {
  return (
    <BlurView intensity={25} tint="dark" style={styles.metricCard}>
      <LinearGradient colors={gradient} style={styles.metricGlow} />
      <Ionicons name={icon} size={22} color={color} />
      <Text style={styles.metricValue}>{formatNumber(value)}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </BlurView>
  );
}

const formatNumber = (num: number) => {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return String(num);
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 70,
    paddingBottom: 100,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginBottom: 16,
  },
  metricCard: {
    width: "44%",
    height: 140,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    overflow: "hidden",
  },
  metricGlow: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.15,
    borderRadius: 20,
  },
  metricValue: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "800",
    marginTop: 6,
  },
  metricLabel: {
    color: "#A1A1A1",
    fontSize: 13,
    marginTop: 4,
  },
  refreshBtn: {
    alignSelf: "center",
    marginTop: 30,
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  refreshText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 6,
  },
  timestamp: {
    textAlign: "center",
    color: "#8E8E93",
    marginTop: 12,
    fontSize: 13,
  },
});
