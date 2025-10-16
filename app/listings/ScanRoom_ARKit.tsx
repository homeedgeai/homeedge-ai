import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function ScanRoom_ARKit() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        ARKit scanning is disabled in Expo Cloud Builds.
      </Text>
      <Text style={styles.subtext}>
        To enable ARKit, run locally with: {"\n"}
        <Text style={styles.command}>npx expo prebuild && npx expo run:ios</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  text: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  subtext: {
    color: "#ccc",
    fontSize: 14,
    marginTop: 15,
    textAlign: "center",
  },
  command: {
    color: "#3B82F6",
    fontWeight: "500",
  },
});
