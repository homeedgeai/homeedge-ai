import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { useRouter, useFocusEffect } from "expo-router";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { downloadAndShare } from "../../utils/downloadHelper";

export default function ListingsScreen() {
  const router = useRouter();
  const [listings, setListings] = React.useState<any[]>([]);

  // 🔹 Auto-refresh every time user returns to this screen
  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        const stored = await AsyncStorage.getItem("ohai:listings");
        if (stored) {
          const parsed = JSON.parse(stored);
          // newest first
          const sorted = parsed.sort(
            (a: any, b: any) =>
              new Date(b.date || b.createdAt || 0).getTime() -
              new Date(a.date || a.createdAt || 0).getTime()
          );
          setListings(sorted);
        }
      })();
    }, [])
  );

  const handleDelete = async (title: string) => {
    Alert.alert("Delete Listing", `Remove “${title}”?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const filtered = listings.filter((l) => l.title !== title);
          setListings(filtered);
          await AsyncStorage.setItem("ohai:listings", JSON.stringify(filtered));
        },
      },
    ]);
  };

  // 🔹 Tag a listing to Smart Map (adds GPS coords)
  const handleAddLocation = async (listing: any) => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Please allow location access.");
        return;
      }
      const { coords } = await Location.getCurrentPositionAsync({});
      const updatedListings = listings.map((l) =>
        l.title === listing.title ? { ...l, coords } : l
      );
      setListings(updatedListings);
      await AsyncStorage.setItem("ohai:listings", JSON.stringify(updatedListings));
      Alert.alert("Location Added ✅", "This listing will now appear on Smart Map.");
    } catch (err) {
      console.log("Error tagging location:", err);
    }
  };

  return (
    <LinearGradient
      colors={["#F9FAFB", "#E5E7EB"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.root}
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Listings</Text>
          <TouchableOpacity
            onPress={() => {
              if (router?.canGoBack?.()) router.back();
              else router?.push?.("/");
            }}
            style={styles.backBtn}
          >
            <Ionicons name="chevron-back" size={22} color="#007AFF" />
            <Text style={styles.backTxt}>Back</Text>
          </TouchableOpacity>
        </View>

        {/* Listing Cards */}
        {listings.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="home-outline" size={46} color="#9CA3AF" />
            <Text style={styles.emptyText}>
              No listings yet. Generate or scan one below!
            </Text>
          </View>
        ) : (
          listings.map((listing, index) => (
            <BlurView
              key={index}
              intensity={Platform.OS === "ios" ? 30 : 80}
              tint="light"
              style={styles.card}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>
                  {listing.title || `Listing #${index + 1}`}
                </Text>
                <View style={{ flexDirection: "row" }}>
                  <TouchableOpacity
                    onPress={() =>
                      downloadAndShare(listing.image, `${listing.title}.jpg`)
                    }
                    style={{ marginRight: 10 }}
                  >
                    <Ionicons name="download-outline" size={20} color="#007AFF" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(listing.title)}
                    style={{ padding: 4 }}
                  >
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>

              {listing.image && (
                <Image
                  source={{ uri: listing.image }}
                  style={styles.thumbnail}
                  resizeMode="cover"
                />
              )}
              <Text style={styles.cardDesc}>
                {listing.description || "No description provided."}
              </Text>
              <Text style={styles.cardDate}>
                Created:{" "}
                {new Date(listing.date || listing.createdAt || Date.now()).toLocaleString()}
              </Text>

              {/* Quick Actions */}
              <View style={styles.quickRow}>
                <TouchableOpacity
                  style={styles.mapTagBtn}
                  onPress={() => handleAddLocation(listing)}
                >
                  <Ionicons name="location-outline" size={18} color="#34C759" />
                  <Text style={styles.mapTagTxt}>Tag to Map</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.openBtn}
                  onPress={() => downloadAndShare(listing.image, `${listing.title}.jpg`)}
                >
                  <Ionicons name="share-outline" size={18} color="#007AFF" />
                  <Text style={styles.openTxt}>Share</Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          ))
        )}

        {/* Quick Actions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsRow}>
            <ActionButton
              icon="construct-outline"
              color="#007AFF"
              label="Generate"
              onPress={() => router.push("/tabs/generate-listing")}
            />
            <ActionButton
              icon="camera-outline"
              color="#34C759"
              label="Scan"
              onPress={() => router.push("/listings/scan-room")}
            />
            <ActionButton
              icon="image-outline"
              color="#FF9500"
              label="Render"
              onPress={() => router.push("/listings/house-render")}
            />
            <ActionButton
              icon="grid-outline"
              color="#AF52DE"
              label="Plan"
              onPress={() => router.push("/listings/floorplan")}
            />
          </View>
        </View>

        {/* Gallery Access */}
        <TouchableOpacity
          style={styles.galleryButton}
          onPress={() => router.push("/(drawer)/gallery")}
        >
          <Ionicons name="albums-outline" size={22} color="#fff" />
          <Text style={styles.galleryText}>Floorplans & 3D Gallery</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

function ActionButton({
  icon,
  label,
  color,
  onPress,
}: {
  icon: any;
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.actionButton, { backgroundColor: color }]}
      onPress={onPress}
    >
      <Ionicons name={icon} size={20} color="#fff" />
      <Text style={styles.actionText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingTop: 60 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: { fontSize: 34, fontWeight: "700", color: "#111827" },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,122,255,0.08)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  backTxt: { color: "#007AFF", fontWeight: "600", marginLeft: 4 },
  emptyWrap: { alignItems: "center", justifyContent: "center", marginTop: 80 },
  emptyText: {
    color: "#6B7280",
    marginTop: 10,
    textAlign: "center",
    fontSize: 16,
    width: "80%",
  },
  card: {
    marginHorizontal: 16,
    borderRadius: 18,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.85)",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  cardTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
  thumbnail: { width: "100%", height: 180, borderRadius: 12, marginBottom: 10 },
  cardDesc: { fontSize: 14, color: "#4B5563", marginBottom: 4 },
  cardDate: { fontSize: 12, color: "#9CA3AF" },
  quickRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mapTagBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(52,199,89,0.15)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  mapTagTxt: {
    color: "#34C759",
    fontWeight: "600",
    marginLeft: 4,
    fontSize: 14,
  },
  openBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
  },
  openTxt: {
    color: "#007AFF",
    fontWeight: "600",
    marginLeft: 4,
  },
  section: { marginTop: 30, paddingHorizontal: 20 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: 10,
    width: "48%",
  },
  actionText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 6,
    fontSize: 15,
  },
  galleryButton: {
    marginTop: 40,
    marginHorizontal: 20,
    backgroundColor: "#007AFF",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
    paddingVertical: 14,
  },
  galleryText: { color: "#fff", fontSize: 16, fontWeight: "600", marginLeft: 6 },
});
