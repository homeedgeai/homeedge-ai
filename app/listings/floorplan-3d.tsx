import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function Floorplan3D() {
  const { mesh_url } = useLocalSearchParams<{ mesh_url?: string }>();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>3D Preview (stub)</Text>
      <Text style={styles.url}>{mesh_url || "No model created yet"}</Text>
      <Text style={styles.note}>
        {Platform.OS === "ios"
          ? "When we add ARKit depth, we’ll export USDZ for native AR Quick Look."
          : "On Android we’ll export GLB for Sceneform/ARCore."}
      </Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container:{ flex:1, alignItems:"center", justifyContent:"center", backgroundColor:"#000", padding:24 },
  title:{ color:"#fff", fontSize:20, fontWeight:"900", marginBottom:8 },
  url:{ color:"#9ff", textAlign:"center", marginBottom:14 },
  note:{ color:"#ccc", textAlign:"center" }
});
