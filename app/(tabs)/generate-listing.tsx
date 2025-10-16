// app/(tabs)/generate-listing.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";

export default function GenerateListingScreen() {
  const [address, setAddress] = useState("");
  const [price, setPrice] = useState("");
  const [beds, setBeds] = useState("");
  const [baths, setBaths] = useState("");
  const [media, setMedia] = useState<string | null>(null);
  const [floorplan, setFloorplan] = useState<string | null>(null);

  const handleUpload = () => {
    // Mock photo upload
    setMedia("https://images.unsplash.com/photo-1600585154526-990dced4db0d");
  };

  const handleGenerateFloorplan = () => {
    // Mock AI-generated floorplan
    setFloorplan("https://i.imgur.com/0Zf7TqK.png");
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>Generate New Listing</Text>

      {/* Address */}
      <TextInput
        style={styles.input}
        placeholder="Property Address"
        value={address}
        onChangeText={setAddress}
      />

      {/* Price */}
      <TextInput
        style={styles.input}
        placeholder="Price"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />

      {/* Beds */}
      <TextInput
        style={styles.input}
        placeholder="Bedrooms"
        value={beds}
        onChangeText={setBeds}
        keyboardType="numeric"
      />

      {/* Baths */}
      <TextInput
        style={styles.input}
        placeholder="Bathrooms"
        value={baths}
        onChangeText={setBaths}
        keyboardType="numeric"
      />

      {/* Upload Button */}
      <TouchableOpacity style={styles.uploadBtn} onPress={handleUpload}>
        <Text style={styles.uploadTxt}>
          {media ? "📸 Media Uploaded" : "📤 Upload Photo / Video"}
        </Text>
      </TouchableOpacity>

      {/* Media Preview */}
      {media && <Image source={{ uri: media }} style={styles.mediaPreview} />}

      {/* Generate Floorplan */}
      <TouchableOpacity
        style={styles.floorplanBtn}
        onPress={handleGenerateFloorplan}
      >
        <Text style={styles.floorplanTxt}>🛠️ Generate Floorplan</Text>
      </TouchableOpacity>

      {/* Floorplan Preview */}
      {floorplan && (
        <View style={styles.floorplanBox}>
          <Text style={styles.previewLabel}>Generated Floorplan</Text>
          <Image source={{ uri: floorplan }} style={styles.floorplanPreview} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
    color: "#111827",
  },
  input: {
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  uploadBtn: {
    backgroundColor: "#3B82F6",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  uploadTxt: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  mediaPreview: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    marginBottom: 16,
  },
  floorplanBtn: {
    backgroundColor: "#10B981",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 16,
  },
  floorplanTxt: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  floorplanBox: {
    marginTop: 10,
    padding: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
  },
  previewLabel: {
    fontWeight: "600",
    marginBottom: 8,
    fontSize: 16,
    color: "#374151",
  },
  floorplanPreview: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
});
