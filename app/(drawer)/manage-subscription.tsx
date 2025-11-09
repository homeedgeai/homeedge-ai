import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function ManageSubscription() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleBack = () => {
    if (router?.canGoBack?.()) router.back();
    else if (router?.push) router.push("/");
  };

  const handleUpgrade = async () => {
    try {
      setIsLoading(true);
      // Simulate API call or Stripe redirect
      await new Promise((resolve) => setTimeout(resolve, 1500));
      Alert.alert("Success", "You’ve upgraded to the Pro plan!");
    } catch (error) {
      console.error("Upgrade failed:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    Alert.alert(
      "Cancel Subscription",
      "Are you sure you want to cancel your plan?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            try {
              setIsLoading(true);
              // Simulate API call
              await new Promise((resolve) => setTimeout(resolve, 1500));
              Alert.alert("Subscription Canceled", "You’re now on the free plan.");
            } catch (error) {
              Alert.alert("Error", "Failed to cancel your subscription.");
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Manage Subscription</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.planLabel}>Current Plan:</Text>
        <Text style={styles.planName}>Free Tier</Text>
        <Text style={styles.description}>
          Upgrade to unlock AI-powered features, faster render times, and premium
          room scanning.
        </Text>

        {isLoading ? (
          <ActivityIndicator size="large" color="#00FFCC" style={{ marginTop: 20 }} />
        ) : (
          <>
            <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade}>
              <Ionicons name="rocket-outline" size={20} color="#000" />
              <Text style={styles.upgradeText}>Upgrade to Pro</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Ionicons name="close-circle-outline" size={20} color="#FF3B30" />
              <Text style={styles.cancelText}>Cancel Subscription</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 40,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  backText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 4,
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  content: {
    alignItems: "center",
  },
  planLabel: {
    color: "#aaa",
    fontSize: 14,
  },
  planName: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
  },
  description: {
    color: "#ccc",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 40,
  },
  upgradeButton: {
    backgroundColor: "#00FFCC",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "80%",
  },
  upgradeText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
  cancelButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: "#FF3B30",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "80%",
  },
  cancelText: {
    color: "#FF3B30",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 6,
  },
});
