import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function ARViewScreen() {
  const router = useRouter();
  const { mesh_url } = useLocalSearchParams<{ mesh_url?: string }>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AR View Placeholder</Text>

      {mesh_url ? (
        <>
          <Text style={styles.subtitle}>Received mesh URL:</Text>
          <Text style={styles.code}>{mesh_url}</Text>
        </>
      ) : (
        <Text style={styles.subtitle}>No mesh provided yet.</Text>
      )}

      <Pressable style={styles.button} onPress={() => router.back()}>
        <Text style={styles.buttonText}>Back</Text>
      </Pressable>

      <Text style={styles.note}>
        This is a placeholder.  
        After build succeeds, we replace it with LiDAR scanning.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
  },
  subtitle: {
    fontSize: 14,
    color: "#ccc",
    textAlign: "center",
  },
  code: {
    fontSize: 12,
    color: "#7FD3FF",
    textAlign: "center",
    marginTop: 4,
  },
  button: {
    marginTop: 24,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#2563EB",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  note: {
    marginTop: 24,
    fontSize: 12,
    color: "#888",
    textAlign: "center",
  },
});
