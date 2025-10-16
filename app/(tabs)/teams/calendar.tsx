import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function TeamCalendarScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Team Calendar</Text>
      {/* Your calendar component here */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  title: { fontSize: 22, fontWeight: "700" },
});
