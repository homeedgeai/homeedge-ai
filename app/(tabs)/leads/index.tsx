// app/(tabs)/leads/index.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function LeadsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Leads</Text>
      <Text style={styles.subtitle}>
        This is where lead interactions and messages will show (mock for now).
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 8 },
  subtitle: { color: "#6b7280" },
});
