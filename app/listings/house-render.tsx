import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Share,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, fonts } from "../../src/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

const STYLES = ["Modern", "Luxury", "Farmhouse", "Minimalist", "Scandinavian"];

export default function HouseRenderScreen() {
  const [original, setOriginal] = useState<string | null>(null);
  const [style, setStyle] = useState<string | null>(null);
  const [generated, setGenerated] = useState<string | null>(null);
  const router = useRouter();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) {
      setOriginal(result.assets[0].uri);
      setGenerated(null); // reset
    }
  };

  const generateDesign = async () => {
    if (!original || !style) return;
    // ⚡ DEMO: swap with real AI API later
    // For now, just show placeholder design image
    setGenerated("https://picsum.photos/600/400?random=12");
  };

  const shareImage = async () => {
    try {
      await Share.share({
        message: `🏡 AI ${style} Design\n\nCheck out this redesign!`,
        url: generated || undefined,
      });
    } catch (error) {
      console.error("❌ Share failed", error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>AI Home Design</Text>
        <TouchableOpacity onPress={() => router.push("/(tabs)/settings")}>
          <Image
            source={require("../../assets/images/profile.png")}
            style={styles.avatar}
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Upload */}
        <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
          {original ? (
            <Image source={{ uri: original }} style={styles.uploadImg} />
          ) : (
            <Text style={styles.uploadTxt}>+ Upload Room / House Photo</Text>
          )}
        </TouchableOpacity>

        {/* Style Picker */}
        <Text style={styles.subTitle}>Choose a Style</Text>
        <View style={styles.styleRow}>
          {STYLES.map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.pill, style === s && styles.pillActive]}
              onPress={() => setStyle(s)}
            >
              <Text style={style === s ? styles.pillTxtActive : styles.pillTxt}>
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Generate Button */}
        <TouchableOpacity
          style={[styles.button, !(original && style) && { opacity: 0.5 }]}
          onPress={generateDesign}
          disabled={!original || !style}
        >
          <Text style={styles.buttonText}>✨ Generate Design</Text>
        </TouchableOpacity>

        {/* Preview */}
        {generated && (
          <View style={styles.previewWrap}>
            <Text style={styles.subTitle}>Preview</Text>
            <View style={styles.previewRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.previewLabel}>Original</Text>
                <Image source={{ uri: original! }} style={styles.previewImg} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.previewLabel}>AI {style}</Text>
                <Image source={{ uri: generated }} style={styles.previewImg} />
              </View>
            </View>

            {/* Share */}
            <TouchableOpacity style={styles.button} onPress={shareImage}>
              <Text style={styles.buttonText}>📤 Share Design</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Footer Logo */}
        <View style={styles.footer}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.footerLogo}
            resizeMode="contain"
          />
          <Text style={styles.footerBrand}>[YourNewBrandName]</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.m,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  back: { fontSize: 16, color: colors.primary },
  title: { ...fonts.h2 },
  avatar: { width: 32, height: 32, borderRadius: 16 },

  uploadBox: {
    height: 200,
    margin: spacing.m,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadImg: { width: "100%", height: "100%", borderRadius: 12 },
  uploadTxt: { ...fonts.body, color: colors.subtext },

  subTitle: {
    ...fonts.h2,
    marginTop: spacing.m,
    marginHorizontal: spacing.m,
    marginBottom: spacing.s,
  },
  styleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginHorizontal: spacing.m,
  },
  pill: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.divider,
    paddingHorizontal: spacing.m,
    paddingVertical: 6,
    marginRight: spacing.s,
    marginBottom: spacing.s,
  },
  pillActive: { backgroundColor: colors.primary },
  pillTxt: { color: colors.text },
  pillTxtActive: { color: "#fff" },

  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.m,
    borderRadius: 12,
    alignItems: "center",
    margin: spacing.m,
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  previewWrap: { marginTop: spacing.m, paddingHorizontal: spacing.m },
  previewRow: { flexDirection: "row", gap: 10 },
  previewLabel: { ...fonts.small, marginBottom: spacing.s },
  previewImg: { width: "100%", height: 160, borderRadius: 12 },

  footer: { marginTop: spacing.l, alignItems: "center" },
  footerLogo: { height: 40, width: 140, opacity: 0.9 },
  footerBrand: { fontSize: 14, color: "#6B7280", marginTop: 4, fontWeight: "600" },
});
