import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

export default function GenerateListingScreen() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
      }}
    >
      <Text style={{ fontSize: 22, fontWeight: "600", marginBottom: 20 }}>
        Generate New Listing
      </Text>

      <TouchableOpacity
        style={{
          backgroundColor: "#007AFF",
          padding: 12,
          borderRadius: 8,
        }}
        onPress={() => alert("Generating listing...")}
      >
        <Text style={{ color: "#fff", fontWeight: "600" }}>Start</Text>
      </TouchableOpacity>
    </View>
  );
}
