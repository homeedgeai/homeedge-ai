import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const API_BASE = process.env.EXPO_PUBLIC_API_BASE || "http://192.168.1.178:8000";

export default function SignupScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleSignup = async () => {
    if (!email || !password || !confirm) return Alert.alert("Error", "Fill in all fields");
    if (password !== confirm) return Alert.alert("Error", "Passwords do not match");

    try {
      const res = await fetch(`${API_BASE}/user/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: email.split("@")[0] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create user");

      await AsyncStorage.setItem("ohai:user", JSON.stringify({ email }));
      Alert.alert("Welcome!", "Account created successfully.");
      router.replace("/");
    } catch (e) {
      console.error(e);
      Alert.alert("Signup failed", e.message);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#020617", "#0B132B", "#1C2541"]} style={StyleSheet.absoluteFill} />
      <View style={styles.form}>
        <Text style={styles.title}>Create Account</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#aaa"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor="#aaa"
          secureTextEntry
          value={confirm}
          onChangeText={setConfirm}
        />
        <TouchableOpacity style={styles.button} onPress={handleSignup}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  form: { width: "85%", backgroundColor: "rgba(0,0,0,0.55)", borderRadius: 20, padding: 24 },
  title: { color: "#fff", fontSize: 28, fontWeight: "800", textAlign: "center", marginBottom: 20 },
  input: {
    width: "100%", backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 10,
    padding: 12, marginBottom: 16, color: "#fff",
  },
  button: {
    backgroundColor: "#007AFF", borderRadius: 12, paddingVertical: 12,
    alignItems: "center", marginTop: 8,
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
});
