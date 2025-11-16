import React from "react";
import { View, Text, StyleSheet, Platform, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function Floorplan3D() {
  const { mesh_url } = useLocalSearchParams<{ mesh_url?: string }>();

  const displayURL = mesh_url || "No 3D model generated yet.";

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner}>
        <Text style={styles.title}>3D Preview (Coming Soon)</Text>

        <Text style={styles.urlLabel}>Mesh URL:</Text>
        <Text style={styles.url}>{displayURL}</Text>

        <View style={{ height: 20 }} />

        <Text style={styles.note}>
          {Platform.OS === "ios"
            ? "When real LiDAR depth is integrated, you'll view a full 3D mesh here and place it in AR using ARKit."
            : "On Android we will export GLB models for ARCore / Sceneform viewing."}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  inner: {
    alignItems: "center",
    justifyContent: "flex-start",
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 12,
    textAlign: "center",
  },
  urlLabel: {
    color: "#9ff",
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 4,
  },
  url: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
    backgroundColor: "#111",
    padding: 10,
    borderRadius: 8,
    width: "100%",
  },
  note: {
    color: "#ccc",
    fontSize: 14,
    marginTop: 20,
    textAlign: "center",
    lineHeight: 20,
  },
});
