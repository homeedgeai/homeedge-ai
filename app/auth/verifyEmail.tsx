// app/auth/verifyEmail.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { auth } from "../../firebaseConfig";
import { useRouter } from "expo-router";

export default function VerifyEmailScreen() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const interval = setInterval(async () => {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        setChecking(false);
        return;
      }

      await currentUser.reload();

      if (auth.currentUser?.emailVerified) {
        clearInterval(interval);
        // If you want to go straight into the app, use: router.replace("/(drawer)");
        router.replace("/auth/verify-success");
      }

      setChecking(false);
    }, 3000);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Check Your Email 📩</Text>
      <Text style={styles.subtitle}>
        We sent you a verification link. Once verified, this screen will update
        automatically.
      </Text>

      <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 30 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
  },
});
