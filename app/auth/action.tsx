import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  applyActionCode,
  confirmPasswordReset,
  verifyPasswordResetCode,
} from "firebase/auth";
import { auth } from "../../firebaseConfig";

export default function AuthActionHandler() {
  const router = useRouter();
  const { mode, oobCode } = useLocalSearchParams();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Please wait…");

  useEffect(() => {
    if (!mode || !oobCode) {
      setStatus("error");
      setMessage("Invalid or expired action link.");
      return;
    }

    handleAction();
  }, [mode, oobCode]);

  const handleAction = async () => {
    try {
      switch (mode) {
        case "verifyEmail":
          setMessage("Verifying your email…");
          await applyActionCode(auth, oobCode as string);
          setStatus("success");
          setMessage("Your email has been verified!");
          break;

        case "resetPassword":
          setMessage("Validating reset link…");
          await verifyPasswordResetCode(auth, oobCode as string);
          setStatus("success");
          setMessage("Password reset link confirmed. Open the app to continue.");
          break;

        default:
          setStatus("error");
          setMessage("Unsupported action.");
          break;
      }
    } catch (e: any) {
      setStatus("error");
      setMessage("This link is invalid or has already been used.");
    }
  };

  const goToApp = () => {
    router.replace("/");
  };

  return (
    <LinearGradient
      colors={["#FFFFFF", "#F3F8FF", "#E6F0FF"]}
      style={styles.container}
    >
      <View style={styles.card}>
        {status === "loading" && <ActivityIndicator size="large" color="#2563EB" />}

        <Text style={styles.title}>
          {status === "success" ? "All Set 🎉" : status === "error" ? "Oops" : "Processing…"}
        </Text>

        <Text style={styles.message}>{message}</Text>

        {status !== "loading" && (
          <TouchableOpacity style={styles.button} onPress={goToApp}>
            <Text style={styles.buttonText}>Return to App</Text>
          </TouchableOpacity>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  card: {
    width: "85%",
    padding: 26,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.85)",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  title: {
    marginTop: 20,
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
  },
  message: {
    marginTop: 12,
    fontSize: 15,
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 14,
    marginTop: 14,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
