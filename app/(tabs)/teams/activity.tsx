import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { useAppContext } from "../../../src/context/AppContext";

// Mock activity feed
const mockActivity = [
  { id: "1", text: "John created a new listing." },
  { id: "2", text: "Sarah joined Downtown Agents team." },
  { id: "3", text: "Team meeting scheduled for Monday." },
];

export default function TeamActivityScreen() {
  const { user } = useAppContext();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent Activity</Text>
      <FlatList
        data={mockActivity}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Text style={styles.item}>• {item.text}</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  item: { fontSize: 16, marginBottom: 8, color: "#374151" },
});
