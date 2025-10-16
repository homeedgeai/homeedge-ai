import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAppContext } from "../../../src/context/AppContext";

export default function TeamsHome() {
  const navigation = useNavigation();
  const { teams } = useAppContext();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Teams</Text>

      <FlatList
        data={teams}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("TeamDetail", { teamId: item.id })}
          >
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.members}>{item.members.length} members</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text>No teams yet. Create one below.</Text>}
      />

      <TouchableOpacity
        style={styles.createBtn}
        onPress={() => navigation.navigate("CreateTeam")}
      >
        <Text style={styles.createTxt}>+ Create New Team</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  card: {
    backgroundColor: "#F3F4F6", padding: 16, borderRadius: 8, marginBottom: 12,
  },
  name: { fontSize: 16, fontWeight: "600" },
  members: { fontSize: 14, color: "#6B7280" },
  createBtn: {
    marginTop: 16, backgroundColor: "#3B82F6", padding: 14, borderRadius: 8, alignItems: "center",
  },
  createTxt: { color: "#fff", fontWeight: "700" },
});
