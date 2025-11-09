import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router"; // ✅ useRouter instead

export default function Dashboard() {
  const router = useRouter(); // ✅ use the hook

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Welcome back, Agent 👋</Text>
      <Text style={styles.subtitle}>Here's your daily overview</Text>

      <View style={styles.quickAccess}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/listings")}
        >
          <Ionicons name="briefcase-outline" size={24} color="#2563EB" />
          <Text style={styles.cardLabel}>Listings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/tabs/calendar")}
        >
          <Ionicons name="calendar-outline" size={24} color="#16A34A" />
          <Text style={styles.cardLabel}>Calendar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/tabs/performance")}
        >
          <Ionicons name="trending-up-outline" size={24} color="#F59E0B" />
          <Text style={styles.cardLabel}>Performance</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    padding: 20,
  },
  welcome: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 24,
  },
  quickAccess: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    width: "30%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  cardLabel: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "500",
  },
});
