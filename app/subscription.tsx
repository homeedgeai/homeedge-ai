import React, { useState } from "react";
import { View, Text, TouchableOpacity, Linking, ActivityIndicator } from "react-native";
import Constants from "expo-constants";

const BACKEND_URL =
  Constants.expoConfig?.extra?.API_BASE || "http://192.168.1.178:8000"; // Fallback if not in app.json

export default function SubscriptionScreen() {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (plan: "basic" | "pro" | "enterprise") => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();
      if (data.url) {
        Linking.openURL(data.url); // Opens Stripe Checkout
      } else {
        alert("Could not start checkout session.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Connection failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 24, justifyContent: "center", backgroundColor: "#f9fafb" }}>
      <Text style={{ fontSize: 28, fontWeight: "bold", textAlign: "center", marginBottom: 40 }}>
        Choose Your Plan
      </Text>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <>
          <TouchableOpacity
            onPress={() => handleSubscribe("basic")}
            style={{
              backgroundColor: "#e5e7eb",
              padding: 16,
              borderRadius: 12,
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "600", textAlign: "center" }}>
              Basic - Free
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleSubscribe("pro")}
            style={{
              backgroundColor: "#3b82f6",
              padding: 16,
              borderRadius: 12,
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 18,
                fontWeight: "600",
                textAlign: "center",
              }}
            >
              Pro - $50/month
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleSubscribe("enterprise")}
            style={{ backgroundColor: "#8b5cf6", padding: 16, borderRadius: 12 }}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 18,
                fontWeight: "600",
                textAlign: "center",
              }}
            >
              Enterprise - $100/month
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
