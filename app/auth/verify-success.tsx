// app/auth/verify-success.tsx
import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import LottieView from "lottie-react";
import { useRouter } from "expo-router";

export default function VerifySuccess() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/");
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <LottieView
        source={require("../../assets/success.json")}
        autoPlay
        loop={false}
        style={{ width: 200, height: 200 }}
      />

      <Text style={styles.title}>Email Verified 🎉</Text>
      <Text style={styles.subtitle}>You can now sign in to your account.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginTop: 20,
  },
  subtitle: {
    marginTop: 8,
    color: "#6B7280",
    fontSize: 15,
  },
});
