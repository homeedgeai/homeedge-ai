import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);

  const handleLogin = async () => {
    setWarning(null);

    if (!email || !password) {
      setWarning("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);

      const userCred = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      const user = userCred.user;

      // ⭐ FIX: Force Firebase to refresh emailVerified
      await user.reload();

      if (!auth.currentUser?.emailVerified) {
        setWarning("Please verify your email before signing in.");
        setLoading(false);
        return;
      }

      // SUCCESS → let layout redirect into app
      router.replace("/(drawer)");

    } catch (e: any) {
      let msg = "Login failed. Try again.";

      if (e.code === "auth/user-not-found") msg = "No account found.";
      else if (e.code === "auth/wrong-password") msg = "Incorrect password.";
      else if (e.code === "auth/invalid-email") msg = "Invalid email format.";

      setWarning(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#FFFFFF", "#F3F8FF", "#E6F0FF"]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ alignItems: "center", justifyContent: "center" }}>
          <View style={styles.card}>
            <Text style={styles.title}>Welcome Back 👋</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <View style={styles.passwordWrap}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0, borderWidth: 0 }]}
                placeholder="Password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />

              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.button, loading && { opacity: 0.7 }]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            {warning && (
              <View style={styles.warningBox}>
                <Text style={styles.warningText}>{warning}</Text>
              </View>
            )}

            <TouchableOpacity onPress={() => router.push("/signup")}>
              <Text style={styles.signupText}>
                New here? <Text style={styles.signupBold}>Create an account</Text>
              </Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: {
    width: "88%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    alignSelf: "center",
    marginTop: 60,
  },
  title: { fontSize: 28, fontWeight: "800", color: "#111827", marginBottom: 4 },
  subtitle: { color: "#6B7280", marginBottom: 20 },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    backgroundColor: "#F9FAFB",
    color: "#111827",
  },
  passwordWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    marginBottom: 14,
    paddingRight: 10,
  },
  button: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  warningBox: {
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
  },
  warningText: {
    color: "#92400E",
    fontSize: 13,
    textAlign: "center",
    fontWeight: "500",
  },
  signupText: {
    color: "#6B7280",
    textAlign: "center",
    marginTop: 10,
  },
  signupBold: {
    color: "#2563EB",
    fontWeight: "700",
  },
});
