import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRoute } from "@react-navigation/native";
import { useAppContext } from "../../../src/context/AppContext";

export default function TeamDetailScreen() {
  const route = useRoute<any>();
  const { teamId } = route.params || {};
  const { teams } = useAppContext();

  const team = teams.find((t) => t.id === teamId);

  if (!team) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Team not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{team.name}</Text>
      <Text style={styles.subtitle}>{team.members.length} members</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 8 },
  subtitle: { fontSize: 16, color: "#6B7280" },
  error: { fontSize: 16, color: "red" },
});
