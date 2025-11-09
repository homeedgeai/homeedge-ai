import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Image,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function GenerateListingScreen() {
  const router = useRouter();

  const [form, setForm] = useState({
    address: "",
    mlsId: "",
    price: "",
    bedrooms: "",
    bathrooms: "",
  });

  const [images, setImages] = useState<string[]>([]);
  const [floorplan2D, setFloorplan2D] = useState<string | null>(null);
  const [tour3D, setTour3D] = useState<string | null>(null);

  const pickImage = async (type: "image" | "2d" | "3d") => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.9,
    });

    if (!result.canceled && result.assets?.length) {
      const uri = result.assets[0].uri;
      if (type === "image") setImages((prev) => [...prev, uri]);
      if (type === "2d") setFloorplan2D(uri);
      if (type === "3d") setTour3D(uri);
    }
  };

  const saveListing = async () => {
    if (!form.address || !form.price) {
      Alert.alert("Missing Info", "Please fill in at least address and price.");
      return;
    }

    const newListing = {
      ...form,
      images,
      floorplan2D,
      tour3D,
      date: new Date().toISOString(),
    };

    try {
      const stored = await AsyncStorage.getItem("ohai:listings");
      const parsed = stored ? JSON.parse(stored) : [];
      const updated = [...parsed, newListing];
      await AsyncStorage.setItem("ohai:listings", JSON.stringify(updated));

      Alert.alert("Listing Saved ✅", "Your MLS listing has been added.");
      if (router?.canGoBack?.()) router.back();
      else router?.push?.("/");
    } catch (e) {
      console.log("Save error:", e);
      Alert.alert("Error", "Could not save listing.");
    }
  };

  return (
    <LinearGradient
      colors={["#F9FAFB", "#E5E7EB"]}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Create MLS Listing</Text>
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

        {/* Form */}
        <BlurView
          intensity={Platform.OS === "ios" ? 30 : 80}
          tint="light"
          style={styles.formCard}
        >
          <Text style={styles.sectionTitle}>Property Details</Text>

          <InputField
            label="Property Address"
            placeholder="123 Apple Park Way"
            value={form.address}
            onChangeText={(t) => setForm({ ...form, address: t })}
          />
          <InputField
            label="MLS ID"
            placeholder="e.g. 1234567"
            value={form.mlsId}
            onChangeText={(t) => setForm({ ...form, mlsId: t })}
          />
          <InputField
            label="Price"
            placeholder="$999,000"
            keyboardType="numeric"
            value={form.price}
            onChangeText={(t) => setForm({ ...form, price: t })}
          />
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 6 }}>
              <InputField
                label="Bedrooms"
                placeholder="3"
                keyboardType="numeric"
                value={form.bedrooms}
                onChangeText={(t) => setForm({ ...form, bedrooms: t })}
              />
            </View>
            <View style={{ flex: 1 }}>
              <InputField
                label="Bathrooms"
                placeholder="2"
                keyboardType="numeric"
                value={form.bathrooms}
                onChangeText={(t) => setForm({ ...form, bathrooms: t })}
              />
            </View>
          </View>
        </BlurView>

        {/* Upload sections */}
        <BlurView
          intensity={Platform.OS === "ios" ? 25 : 70}
          tint="light"
          style={styles.formCard}
        >
          <Text style={styles.sectionTitle}>Media Uploads</Text>

          <UploadButton
            icon="images-outline"
            color="#007AFF"
            label="Upload Property Images"
            onPress={() => pickImage("image")}
          />
          <UploadButton
            icon="grid-outline"
            color="#FF9500"
            label="Add 2D Floorplan"
            onPress={() => pickImage("2d")}
          />
          <UploadButton
            icon="cube-outline"
            color="#AF52DE"
            label="Add 3D Tour"
            onPress={() => pickImage("3d")}
          />

          {/* Preview thumbnails */}
          <View style={styles.previewWrap}>
            {images.map((img, i) => (
              <Image
                key={i}
                source={{ uri: img }}
                style={styles.thumb}
                resizeMode="cover"
              />
            ))}
            {floorplan2D && (
              <Image source={{ uri: floorplan2D }} style={styles.thumb} />
            )}
            {tour3D && <Image source={{ uri: tour3D }} style={styles.thumb} />}
          </View>
        </BlurView>

        {/* Save button */}
        <TouchableOpacity style={styles.saveBtn} onPress={saveListing}>
          <Ionicons name="checkmark-circle-outline" size={22} color="#fff" />
          <Text style={styles.saveTxt}>Save Listing</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

function InputField({
  label,
  ...props
}: {
  label: string;
  [key: string]: any;
}) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        style={styles.input}
        placeholderTextColor="#9CA3AF"
      />
    </View>
  );
}

function UploadButton({
  icon,
  color,
  label,
  onPress,
}: {
  icon: any;
  color: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.uploadBtn, { backgroundColor: color }]}
      onPress={onPress}
    >
      <Ionicons name={icon} size={20} color="#fff" />
      <Text style={styles.uploadTxt}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    alignItems: "center",
  },
  title: { fontSize: 30, fontWeight: "700", color: "#111827" },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,122,255,0.08)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  backTxt: { color: "#007AFF", fontWeight: "600", marginLeft: 4 },
  formCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 16,
    marginTop: 20,
    backgroundColor: "rgba(255,255,255,0.75)",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  label: { color: "#111827", fontWeight: "500", marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: "rgba(156,163,175,0.3)",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 12,
    padding: 12,
    color: "#111827",
    fontSize: 15,
  },
  row: { flexDirection: "row" },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  uploadTxt: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 6,
    fontSize: 15,
  },
  previewWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  thumb: {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: "#D1D5DB",
  },
  saveBtn: {
    marginTop: 30,
    marginHorizontal: 20,
    backgroundColor: "#34C759",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
    paddingVertical: 14,
  },
  saveTxt: { color: "#fff", fontWeight: "600", marginLeft: 6, fontSize: 16 },
});
