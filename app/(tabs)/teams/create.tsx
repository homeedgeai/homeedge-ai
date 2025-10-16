import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAppContext } from "../../../src/context/AppContext";

export default function CreateTeamScreen() {
  const navigation = useNavigation();
  const { teams, setTeams } = useAppContext();
  const [name, setName] = useState("");

  const handleCreate = () => {
    if (!name.trim()) return;

    const newTeam = { id: Date.now().toString(), name, members: [] };
    setTeams([...teams, newTeam]);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create New Team</Text>
      <TextInput
        style={styles.input}
        placeholder="Team Name"
        value={name}
        onChangeText={setName}
      />
      <TouchableOpacity style={styles.button} onPress={handleCreate}>
        <Text style={styles.buttonText}>Create Team</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  input: {
    borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginBottom: 16,
  },
  button: {
    backgroundColor: "#3B82F6", padding: 12, borderRadius: 8, alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600" },
});
