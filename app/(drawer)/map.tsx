import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, Dimensions, FlatList, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import MapView, { Marker } from "react-native-maps";
import BottomSheet from "@gorhom/bottom-sheet";
import * as Location from "expo-location";

const API_URL = "http://192.168.0.3:8000/listings"; // 🟢 replace with your FastAPI server address

export default function SmartMap() {
  const [region, setRegion] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const bottomSheetRef = useRef<BottomSheet>(null);

  // 🔹 Get current user location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.warn("Permission to access location denied");
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    })();
  }, []);

  // 🔹 Fetch listings from your backend
  const fetchListings = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      const json = await res.json();
      console.log("🏠 Loaded listings:", json.listings?.length || 0);
      setListings(json.listings || []);
    } catch (err) {
      console.error("❌ Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleMarkerPress = (listing: any) => {
    setSelectedListing(listing);
    bottomSheetRef.current?.expand();
  };

  if (!region) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 8 }}>Loading your location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView style={styles.map} region={region} showsUserLocation={true}>
        {listings.map((listing) => (
          <Marker
            key={listing.id}
            coordinate={{
              latitude: listing.latitude,
              longitude: listing.longitude,
            }}
            onPress={() => handleMarkerPress(listing)}
            pinColor="#007AFF"
          />
        ))}
      </MapView>

      {/* 🔹 Bottom Drawer */}
      <BottomSheet ref={bottomSheetRef} snapPoints={["20%", "60%"]} index={-1} enablePanDownToClose>
        <View style={styles.sheetContent}>
          {selectedListing ? (
            <>
              <Image
                source={{ uri: selectedListing.image_url || "https://via.placeholder.com/300" }}
                style={styles.image}
              />
              <Text style={styles.title}>{selectedListing.title}</Text>
              <Text style={styles.price}>${selectedListing.price?.toLocaleString()}</Text>
              <Text style={styles.desc}>{selectedListing.description}</Text>
            </>
          ) : (
            <FlatList
              data={listings}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.listingCard}
                  onPress={() => handleMarkerPress(item)}
                >
                  <Image
                    source={{ uri: item.image_url || "https://via.placeholder.com/200" }}
                    style={styles.thumb}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.listingTitle}>{item.title}</Text>
                    <Text style={styles.listingPrice}>${item.price?.toLocaleString()}</Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                loading ? (
                  <ActivityIndicator size="small" color="#007AFF" />
                ) : (
                  <Text style={{ textAlign: "center", marginTop: 16 }}>No listings yet</Text>
                )
              }
            />
          )}
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  map: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  sheetContent: { flex: 1, padding: 16 },
  image: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    marginBottom: 12,
  },
  title: { fontSize: 20, fontWeight: "600", marginBottom: 4 },
  price: { fontSize: 18, color: "#007AFF", marginBottom: 8 },
  desc: { fontSize: 14, color: "#555" },
  listingCard: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
    padding: 10,
    backgroundColor: "#F9F9F9",
    borderRadius: 10,
  },
  thumb: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: "#E0E0E0",
  },
  listingTitle: { fontWeight: "600", fontSize: 16 },
  listingPrice: { color: "#007AFF", fontSize: 14 },
});
