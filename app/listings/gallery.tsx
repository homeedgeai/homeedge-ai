import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, Modal, StyleSheet, ActivityIndicator, Dimensions } from "react-native";

const { width } = Dimensions.get("window");
const IMAGE_SIZE = width / 2 - 20;

export default function GalleryScreen() {
  const [images, setImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const BACKEND_URL = "http://armonmoore.local:8000"; // update if needed

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/list-uploads`);
        const data = await res.json();
        setImages(data.files || []);
      } catch (err) {
        console.error("Error fetching uploads:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, []);

  const renderItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      onPress={() => setSelectedImage(`${BACKEND_URL}/uploads/${item}`)}
      style={styles.imageContainer}
    >
      <Image source={{ uri: `${BACKEND_URL}/uploads/${item}` }} style={styles.image} />
      <Text style={styles.filename} numberOfLines={1}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10 }}>Loading room images...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📸 Captured Rooms</Text>

      {images.length === 0 ? (
        <View style={styles.center}>
          <Text>No uploads yet. Scan a room to get started!</Text>
        </View>
      ) : (
        <FlatList
          data={images}
          numColumns={2}
          renderItem={renderItem}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.list}
        />
      )}

      {/* Fullscreen preview */}
      <Modal visible={!!selectedImage} transparent onRequestClose={() => setSelectedImage(null)}>
        <View style={styles.modalBackground}>
          <Image source={{ uri: selectedImage! }} style={styles.fullscreenImage} resizeMode="contain" />
          <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedImage(null)}>
            <Text style={styles.closeText}>✕ Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingTop: 60 },
  title: { fontSize: 22, fontWeight: "600", textAlign: "center", marginBottom: 10 },
  list: { paddingHorizontal: 10 },
  imageContainer: {
    margin: 8,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#f5f5f5",
    alignItems: "center",
  },
  image: { width: IMAGE_SIZE, height: IMAGE_SIZE, borderRadius: 10 },
  filename: { fontSize: 12, color: "#555", marginTop: 4, marginBottom: 6 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullscreenImage: { width: "95%", height: "80%" },
  closeButton: {
    position: "absolute",
    bottom: 80,
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  closeText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
