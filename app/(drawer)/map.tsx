import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  Dimensions,
} from "react-native";
import MapView, { Marker, Circle, Callout } from "react-native-maps";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function RealtorMap() {
  const mapRef = useRef<MapView>(null);
  const auth = getAuth();
  const db = getFirestore();
  const storage = getStorage();

  const [region, setRegion] = useState<any>(null);
  const [location, setLocation] = useState<any>(null);
  const [accuracy, setAccuracy] = useState<number>(0);
  const [listings, setListings] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [coords, setCoords] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Track live GPS
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Location permission denied");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
      setAccuracy(loc.coords.accuracy);
      setRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
      Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 5 },
        (pos) => {
          setLocation(pos);
          setAccuracy(pos.coords.accuracy);
        }
      );
    })();
  }, []);

  // Private Firestore listener
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const col = collection(db, "users", user.uid, "listings");
    const unsub = onSnapshot(col, (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setListings(docs);
    });
    return unsub;
  }, []);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });
    if (!res.canceled && res.assets?.length) {
      setPhoto(res.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string, path: string) => {
    const resp = await fetch(uri);
    const blob = await resp.blob();
    const r = ref(storage, path);
    await uploadBytes(r, blob);
    return getDownloadURL(r);
  };

  const saveListing = async () => {
    const user = auth.currentUser;
    if (!user || !coords) return;
    if (!title.trim()) {
      Alert.alert("Add a title");
      return;
    }
    try {
      setSaving(true);
      let photoUrl;
      if (photo) {
        photoUrl = await uploadImage(
          photo,
          `users/${user.uid}/listings/${uuidv4()}.jpg`
        );
      }
      await addDoc(collection(db, "users", user.uid, "listings"), {
        title: title.trim(),
        latitude: coords.latitude,
        longitude: coords.longitude,
        photoUrl,
        price: "$---",
        bedrooms: "-",
        bathrooms: "-",
        createdAt: new Date(),
      });
      setModalVisible(false);
      setTitle("");
      setPhoto(null);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddListing = async () => {
    if (!location) return;
    setCoords(location.coords);
    setModalVisible(true);
  };

  if (!region) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Locating you...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={region}
        showsUserLocation={false}
      >
        {/* 🚶 Realtor position */}
        {location && (
          <>
            <Marker coordinate={location.coords}>
              <View style={styles.userMarker}>
                <Text style={{ fontSize: 16 }}>🚶</Text>
              </View>
            </Marker>
            <Circle
              center={location.coords}
              radius={Math.max(accuracy, 5)}
              strokeColor="rgba(0,122,255,0.3)"
              fillColor="rgba(0,122,255,0.1)"
            />
          </>
        )}

        {/* 📍 Listings */}
        {listings.map((l) => (
          <Marker
            key={l.id}
            coordinate={{ latitude: l.latitude, longitude: l.longitude }}
          >
            <View style={styles.pinWrap}>
              {l.photoUrl ? (
                <Image source={{ uri: l.photoUrl }} style={styles.pinImg} />
              ) : (
                <View style={styles.pricePin}>
                  <Text style={styles.priceText}>{l.price || "$–––"}</Text>
                </View>
              )}
            </View>

            <Callout tooltip>
              <View style={styles.card}>
                {l.photoUrl && (
                  <Image
                    source={{ uri: l.photoUrl }}
                    style={styles.cardImg}
                    resizeMode="cover"
                  />
                )}
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{l.title}</Text>
                  <Text style={styles.cardSub}>
                    {l.bedrooms} 🛏 | {l.bathrooms} 🛁 | {l.price}
                  </Text>
                  <TouchableOpacity style={styles.detailsBtn}>
                    <Text style={styles.detailsTxt}>View Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.fab} onPress={handleAddListing}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Add listing modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBack}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Listing</Text>
            <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
              <Text>{photo ? "✅ Photo added" : "Upload Photo"}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={saveListing}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveTxt}>Save</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelTxt}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  // 🔹 User Icon
  userMarker: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 6,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },

  // 📍 Pin Style
  pinWrap: {
    borderRadius: 22,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  pinImg: { width: 44, height: 44, borderRadius: 22 },
  pricePin: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
  },
  priceText: { color: "#fff", fontWeight: "700" },

  // 📋 Callout Card
  card: {
    width: width * 0.75,
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 8,
  },
  cardImg: { width: "100%", height: 140 },
  cardContent: { padding: 10 },
  cardTitle: { fontWeight: "700", fontSize: 15 },
  cardSub: { color: "#555", marginVertical: 4, fontSize: 13 },
  detailsBtn: {
    marginTop: 6,
    backgroundColor: "#007AFF",
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
  },
  detailsTxt: { color: "#fff", fontWeight: "600" },

  // ➕ Floating Action Button
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#007AFF",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },

  // ➕ Modal
  modalBack: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  uploadBtn: {
    backgroundColor: "#eee",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  saveBtn: {
    backgroundColor: "#007AFF",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  saveTxt: { color: "#fff", fontWeight: "700" },
  cancelBtn: { marginTop: 10, alignItems: "center" },
  cancelTxt: { color: "#007AFF", fontWeight: "600" },
});
