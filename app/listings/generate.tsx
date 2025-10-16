import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";

export default function GenerateListing() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState("");
  const [price, setPrice] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!address || !price || !bedrooms || !bathrooms) {
      Alert.alert("Missing info", "Please fill out all listing details.");
      return;
    }
    try {
      setLoading(true);
      // Simulate AI listing generation (replace with your API later)
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setDescription(
        `Welcome to ${address}, a ${bedrooms}-bed ${bathrooms}-bath home listed at $${price}.`
      );
      setStep(2);
    } catch (err) {
      Alert.alert("Error", "Failed to generate listing.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {step === 1 && (
        <View style={styles.card}>
          <Text style={styles.title}>🧱 Create New Listing</Text>

          <TextInput
            style={styles.input}
            placeholder="Property Address"
            placeholderTextColor="#999"
            value={address}
            onChangeText={setAddress}
          />
          <TextInput
            style={styles.input}
            placeholder="Listing Price ($)"
            placeholderTextColor="#999"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Bedrooms"
            placeholderTextColor="#999"
            value={bedrooms}
            onChangeText={setBedrooms}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Bathrooms"
            placeholderTextColor="#999"
            value={bathrooms}
            onChangeText={setBathrooms}
            keyboardType="numeric"
          />

          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#28a745" }]}
            onPress={handleGenerate}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>✨ Generate Listing</Text>
            )}
          </TouchableOpacity>

          {/* --- NEW SCAN ROOM BUTTON --- */}
          <Text style={{ textAlign: "center", marginTop: 16, color: "#777" }}>
            Or capture real room photos:
          </Text>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#007AFF" }]}
            onPress={() => {
              console.log("Navigating to ScanRoomScreen...");
              router.push("/listings/scan-room");
            }}
          >
            <Text style={styles.buttonText}>📸 Scan Room</Text>
          </TouchableOpacity>
          {/* -------------------------------- */}
        </View>
      )}

      {step === 2 && (
        <View style={styles.card}>
          <Text style={styles.title}>🏠 Generated Listing</Text>
          <Text style={styles.generated}>{description}</Text>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#007AFF" }]}
            onPress={() => setStep(1)}
          >
            <Text style={styles.buttonText}>Create Another</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f7",
  },
  card: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    color: "#000",
  },
  button: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  generated: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    color: "#333",
    marginBottom: 10,
  },
});
