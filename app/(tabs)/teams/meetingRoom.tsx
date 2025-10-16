import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useAppContext } from "../../../src/context/AppContext";

export default function MeetingRoomScreen() {
  const { user } = useAppContext();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Team Meeting Room</Text>
      <Text style={styles.subtitle}>This is where live meetings would appear.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 8 },
  subtitle: { fontSize: 16, color: "#6B7280" },
});
