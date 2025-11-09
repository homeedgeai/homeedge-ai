import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  Dimensions,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { downloadAndShare } from "../../utils/downloadHelper";

const { width } = Dimensions.get("window");

export default function GalleryScreen() {
  const router = useRouter();
  const [media, setMedia] = useState<{ url: string; title: string }[]>([]);
  const [selected, setSelected] = useState<{ url: string; title: string } | null>(
    null
  );

  useEffect(() => {
    (async () => {
      try {
        const floorplansRaw = await AsyncStorage.getItem("ohai:floorplans");
        const listingsRaw = await AsyncStorage.getItem("ohai:listings");
        const floorplans = floorplansRaw ? JSON.parse(floorplansRaw) : [];
        const listings = listingsRaw ? JSON.parse(listingsRaw) : [];

        const combined: { url: string; title: string }[] = [];

        floorplans.forEach((f: any, i: number) =>
          combined.push({
            url: f.image || f.url,
            title: f.title || `Floorplan #${i + 1}`,
          })
        );
        listings.forEach((l: any, i: number) => {
          if (l.image)
            combined.push({
              url: l.image,
              title: l.title || `Listing #${i + 1}`,
            });
        });

        setMedia(combined);
      } catch (e) {
        console.log("Error loading gallery:", e);
      }
    })();
  }, []);

  return (
    <LinearGradient
      colors={["#F9FAFB", "#E5E7EB"]}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Gallery</Text>
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

      {media.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="images-outline" size={52} color="#9CA3AF" />
          <Text style={styles.emptyText}>No floorplans or 3D tours yet.</Text>
        </View>
      ) : (
        <FlatList
          data={media}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between", paddingHorizontal: 12 }}
          keyExtractor={(_, i) => i.toString()}
          contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelected(item)}
              style={styles.mediaCard}
            >
              <Image source={{ uri: item.url }} style={styles.thumb} />
              <BlurView intensity={Platform.OS === "ios" ? 20 : 60} tint="light" style={styles.overlay}>
                <Text style={styles.cardText} numberOfLines={1}>
                  {item.title}
                </Text>
              </BlurView>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Full-screen preview modal */}
      <Modal visible={!!selected} animationType="fade" transparent={true}>
        <View style={styles.modalWrap}>
          <Image
            source={{ uri: selected?.url }}
            style={styles.fullImage}
            resizeMode="contain"
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: "#007AFF" }]}
              onPress={() => downloadAndShare(selected!.url, `${selected!.title}.jpg`)}
            >
              <Ionicons name="download-outline" size={20} color="#fff" />
              <Text style={styles.actionText}>Download</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: "#34C759" }]}
              onPress={() => downloadAndShare(selected!.url, `${selected!.title}.jpg`)}
            >
              <Ionicons name="share-outline" size={20} color="#fff" />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: "#EF4444" }]}
              onPress={() => setSelected(null)}
            >
              <Ionicons name="close-outline" size={22} color="#fff" />
              <Text style={styles.actionText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    marginBottom: 8,
  },
  title: { fontSize: 32, fontWeight: "700", color: "#111827" },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,122,255,0.08)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  backTxt: { color: "#007AFF", fontWeight: "600", marginLeft: 4 },
  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
  },
  emptyText: {
    color: "#6B7280",
    marginTop: 10,
    textAlign: "center",
    fontSize: 16,
    width: "80%",
  },
  mediaCard: {
    width: (width - 36) / 2,
    height: 180,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 14,
    backgroundColor: "rgba(255,255,255,0.6)",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },
  thumb: { width: "100%", height: "100%" },
  overlay: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  cardText: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "600",
  },
  modalWrap: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: "90%",
    height: "70%",
    borderRadius: 12,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 20,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  actionText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 6,
    fontSize: 15,
  },
});
