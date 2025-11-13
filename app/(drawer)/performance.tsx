import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import NetInfo from "@react-native-community/netinfo";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import * as SecureStore from "expo-secure-store";

const API_BASE = process.env.EXPO_PUBLIC_API_BASE;

export default function PerformanceScreen() {
  const [connected, setConnected] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Detect network
  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) =>
      setIsConnected(!!state.isConnected)
    );
    return () => unsub();
  }, []);

  const handleConnectMeta = async () => {
    try {
      const redirectUrl = Linking.createURL("auth/callback");
      const authUrl = `${API_BASE}/api/meta/auth?redirect_uri=${encodeURIComponent(
        redirectUrl
      )}`;

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);

      if (result.type === "success" && result.url) {
        const params = Linking.parse(result.url).queryParams;
        const token = params?.access_token as string;
        if (token) {
          await SecureStore.setItemAsync("meta_token", token);
          setConnected(true);
          Alert.alert("Connected", "Meta account linked successfully!");
        } else {
          Alert.alert("Error", "No access token received.");
        }
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Connection Error", "Unable to connect to Meta.");
    }
  };

  const fetchMetrics = async () => {
    const token = await SecureStore.getItemAsync("meta_token");
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/fb/metrics`);
      const data = await res.json();
      setListings(data.posts || []);
    } catch {
      setError("Failed to load metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (connected && isConnected) fetchMetrics();
  }, [connected, isConnected]);

  if (!isConnected) {
    return (
      <GradientWrapper>
        <View style={styles.center}>
          <Ionicons name="wifi-outline" size={40} color="#999" />
          <Text style={styles.offlineTitle}>You’re Offline</Text>
          <Text style={styles.offlineSubtitle}>
            Connect to the internet to load your performance.
          </Text>
        </View>
      </GradientWrapper>
    );
  }

  if (!connected) {
    return (
      <GradientWrapper>
        <View style={styles.center}>
          <Text style={styles.title}>Connect Your Meta Account</Text>
          <Text style={styles.subtitle}>
            Link your Facebook & Instagram to track performance.
          </Text>
          <TouchableOpacity
            style={[styles.connectButton, { backgroundColor: "#1877F2" }]}
            activeOpacity={0.8}
            onPress={handleConnectMeta}
          >
            <Ionicons name="logo-facebook" size={18} color="#fff" />
            <Text style={styles.connectLabel}>Connect Meta (Facebook + Instagram)</Text>
          </TouchableOpacity>
        </View>
      </GradientWrapper>
    );
  }

  return (
    <GradientWrapper>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Your Listings Performance</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#0A84FF" style={{ marginTop: 40 }} />
        ) : error ? (
          <View style={styles.center}>
            <Ionicons name="alert-circle-outline" size={40} color="#FF453A" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <View>
            {listings.length === 0 ? (
              <Text style={styles.noListings}>No recent listings yet.</Text>
            ) : (
              listings.map((item, idx) => (
                <View key={idx} style={styles.card}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <View style={styles.metrics}>
                    <Metric label="Views" value={item.views || 0} />
                    <Metric label="Reach" value={item.reach || 0} />
                    <Metric label="Engagement" value={item.engagement || 0} />
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </GradientWrapper>
  );
}

function GradientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <LinearGradient
      colors={["#0A0A0A", "#1A1A1A", "#000"]}
      style={{ flex: 1, justifyContent: "center" }}
    >
      {children}
    </LinearGradient>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingTop: 70, paddingBottom: 100 },
  title: {
    fontSize: 30,
    fontWeight: "900",
    color: "#fff",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    color: "#ccc",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 30,
    paddingHorizontal: 30,
  },
  center: { alignItems: "center", justifyContent: "center", paddingHorizontal: 20 },
  offlineTitle: { color: "#fff", fontWeight: "700", fontSize: 20, marginTop: 10 },
  offlineSubtitle: {
    color: "#ccc",
    fontSize: 14,
    textAlign: "center",
    marginTop: 5,
  },
  connectButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8 as any,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginVertical: 12,
    width: "80%",
    justifyContent: "center",
  },
  connectLabel: { color: "#fff", fontWeight: "600", fontSize: 15, textAlign: "center" },
  card: {
    backgroundColor: "rgba(255,255,255,0.05)",
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 18,
    borderRadius: 16,
  },
  cardTitle: { color: "#fff", fontWeight: "700", fontSize: 16, marginBottom: 10 },
  metrics: { flexDirection: "row", justifyContent: "space-between" },
  metric: { alignItems: "center", width: "30%" },
  metricValue: { color: "#fff", fontWeight: "700", fontSize: 17 },
  metricLabel: { color: "#888", fontSize: 13 },
  errorText: {
    color: "#FF453A",
    fontWeight: "600",
    textAlign: "center",
    marginTop: 10,
  },
  noListings: {
    color: "#aaa",
    textAlign: "center",
    fontSize: 15,
    marginTop: 50,
  },
});
