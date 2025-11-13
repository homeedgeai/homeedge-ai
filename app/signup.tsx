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
import { useRouter } from "expo-router";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [canResend, setCanResend] = useState(false);
  const [userRef, setUserRef] = useState<any>(null);

  const handleSignup = async () => {
    setInfo(null);
    setCanResend(false);

    if (!name || !email || !password || !confirm) {
      setInfo("Please fill all required fields.");
      return;
    }
    if (password !== confirm) {
      setInfo("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      // Create Firebase user
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      const user = userCred.user;
      setUserRef(user);
      await updateProfile(user, { displayName: name });

      // Send verification email
      await sendEmailVerification(user);

      // Write to Firestore (retry logic)
      const userDoc = doc(db, "users", user.uid);
      let writeSuccess = false;
      let attempts = 0;
      while (!writeSuccess && attempts < 3) {
        try {
          await setDoc(userDoc, {
            name,
            email,
            plan: "none",
            verified: false,
            createdAt: serverTimestamp(),
          });
          writeSuccess = true;
        } catch {
          attempts++;
          await new Promise((r) => setTimeout(r, 1000));
        }
      }

      setInfo(
        "A verification link has been sent to your email. Please verify your account before signing in."
      );
      setCanResend(true);

      // Redirect to login after a short delay
      setTimeout(() => router.replace("/login"), 3500);
    } catch (e: any) {
      setInfo(e.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!userRef) {
      setInfo("Please create an account first.");
      return;
    }
    try {
      await sendEmailVerification(userRef);
      setInfo("Verification email resent. Check your inbox.");
    } catch (e: any) {
      setInfo(e.message || "Failed to resend verification email.");
    }
  };

  return (
    <LinearGradient
      colors={["#FFFFFF", "#F3F8FF", "#E6F0FF"]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View style={styles.card}>
            <Text style={styles.title}>Create Your Account</Text>
            <Text style={styles.subtitle}>Start exploring in seconds</Text>

            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#9CA3AF"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              value={confirm}
              onChangeText={setConfirm}
            />

            <TouchableOpacity
              style={[styles.button, loading && { opacity: 0.6 }]}
              onPress={handleSignup}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            {info && (
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>{info}</Text>
                {canResend && (
                  <TouchableOpacity
                    style={styles.resendBtn}
                    onPress={handleResendEmail}
                  >
                    <Text style={styles.resendText}>Resend Verification Email</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            <TouchableOpacity onPress={() => router.push("/login")}>
              <Text style={styles.linkText}>
                Already have an account?{" "}
                <Text style={styles.linkBold}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center" },
  card: {
    width: "88%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
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
  button: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 6,
    marginBottom: 12,
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  infoBox: {
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
    alignItems: "center",
  },
  infoText: {
    color: "#92400E",
    fontSize: 13,
    textAlign: "center",
    fontWeight: "500",
  },
  resendBtn: {
    marginTop: 8,
    backgroundColor: "#2563EB",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  resendText: { color: "#fff", fontWeight: "600" },
  linkText: { color: "#6B7280", textAlign: "center", marginTop: 10 },
  linkBold: { color: "#2563EB", fontWeight: "700" },
});
