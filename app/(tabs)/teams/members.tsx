import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { useAppContext } from "../../../src/context/AppContext";

export default function TeamMembersScreen() {
  const { teams } = useAppContext();

  const allMembers = teams.flatMap((t) => t.members);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>All Members</Text>
      <FlatList
        data={allMembers}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => <Text style={styles.member}>• {item}</Text>}
        ListEmptyComponent={<Text>No members yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  member: { fontSize: 16, marginBottom: 8, color: "#374151" },
});
