import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

type Listing = {
  id: string;
  address: string;
  price: string;
  beds: number;
  baths: number;
  images: string[];
};

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1560185127-6ed189bf04eb?auto=format&fit=crop&w=1200&q=80";

export default function ListingsScreen() {
  const [listings, setListings] = useState<Listing[]>([]);
  const navigation = useNavigation();

  const addListing = (listing: Omit<Listing, "id">) => {
    // fallback image if none provided
    const safeListing: Listing = {
      ...listing,
      id: Date.now().toString(),
      images: listing.images && listing.images.length > 0 ? listing.images : [DEFAULT_IMAGE],
    };

    setListings((prev) => [safeListing, ...prev]);
  };

  const removeListing = (id: string) => {
    setListings((prev) => prev.filter((l) => l.id !== id));
  };

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.title}>My Listings</Text>

        <FlatList
          data={listings}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text style={styles.empty}>No listings yet.</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image source={{ uri: item.images[0] }} style={styles.image} />
              <View style={styles.info}>
                <Text style={styles.address}>{item.address}</Text>
                <Text style={styles.price}>{item.price}</Text>
                <Text style={styles.details}>
                  {item.beds} bd · {item.baths} ba
                </Text>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() =>
                    Alert.alert("Remove Listing", "Are you sure?", [
                      { text: "Cancel", style: "cancel" },
                      { text: "Remove", style: "destructive", onPress: () => removeListing(item.id) },
                    ])
                  }
                >
                  <Text style={styles.deleteTxt}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />

        {/* Demo Button to add a fake listing quickly */}
        <TouchableOpacity
          style={styles.demoBtn}
          onPress={() =>
            addListing({
              address: "123 Maple St, Springfield, IL",
              price: "$285,000",
              beds: 3,
              baths: 2,
              images: [], // empty on purpose to test fallback
            })
          }
        >
          <Text style={styles.demoTxt}>+ Add Test Listing</Text>
        </TouchableOpacity>

        {/* 🔹 AI Tools section */}
        <Text style={[styles.title, { marginTop: 24 }]}>AI Tools</Text>

        <TouchableOpacity
          style={styles.aiBtn}
          onPress={() => navigation.navigate("floorplan" as never)}
        >
          <Text style={styles.aiTxt}>📐 Generate Floorplan</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.aiBtn}
          onPress={() => navigation.navigate("house-render" as never)}
        >
          <Text style={styles.aiTxt}>🏠 Generate House Render</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff", padding: 16 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 12 },
  empty: { textAlign: "center", color: "#6b7280", marginTop: 20 },

  card: {
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  image: { width: 100, height: 100 },
  info: { flex: 1, padding: 10 },
  address: { fontWeight: "700", fontSize: 16 },
  price: { color: "#3B82F6", fontWeight: "600", marginTop: 4 },
  details: { color: "#6b7280", marginTop: 2 },

  deleteBtn: {
    marginTop: 8,
    alignSelf: "flex-start",
    backgroundColor: "#EF4444",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  deleteTxt: { color: "#fff", fontWeight: "600" },

  demoBtn: {
    marginTop: 20,
    backgroundColor: "#3B82F6",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  demoTxt: { color: "#fff", fontWeight: "700" },

  aiBtn: {
    marginTop: 12,
    backgroundColor: "#10B981",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  aiTxt: { color: "#fff", fontWeight: "700" },
});
