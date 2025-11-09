import { getProfile, Profile, saveProfile } from "@lib/profile";
import { useTheme } from "@src/context/ThemeContext";
import { colors, fonts, spacing } from "@src/theme";
import { BlurView } from "expo-blur";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SettingsScreen() {
  const { theme, toggleTheme } = useTheme();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [pushEnabled, setPushEnabled] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await getProfile();
      setProfile(data);
    })();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setProfile((p) =>
        p ? { ...p, avatar: result.assets[0].uri } : { name: "", avatar: result.assets[0].uri }
      );
    }
  };

  const save = async () => {
    if (profile) {
      await saveProfile(profile); // ✅ Persist to AsyncStorage
      alert("✅ Profile saved!");
    }
  };

  if (!profile) return <Text style={{ padding: spacing.m }}>Loading…</Text>;

  return (
    <View style={{ flex: 1, backgroundColor: theme === "dark" ? "#000" : "#f2f2f7" }}>
      <ScrollView contentContainerStyle={{ padding: spacing.m, paddingBottom: 80 }}>
        <Text style={styles.title}>Settings</Text>

        {/* Appearance */}
        <BlurView intensity={70} tint={theme === "dark" ? "dark" : "light"} style={styles.card}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Dark Mode</Text>
            <Switch value={theme === "dark"} onValueChange={toggleTheme} />
          </View>
        </BlurView>

        {/* Profile */}
        <BlurView intensity={70} tint={theme === "dark" ? "dark" : "light"} style={styles.card}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <View style={styles.row}>
            {profile.avatar ? (
              <Image source={{ uri: profile.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarTxt}>
                  {profile.name
                    ? profile.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                    : "U"}
                </Text>
              </View>
            )}
            <TouchableOpacity onPress={pickImage}>
              <Text style={styles.link}>Change Avatar</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Your Name"
            placeholderTextColor={colors.subtext}
            value={profile.name}
            onChangeText={(t) => setProfile({ ...profile, name: t })}
          />
        </BlurView>

        {/* Notifications */}
        <BlurView intensity={70} tint={theme === "dark" ? "dark" : "light"} style={styles.card}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Push Notifications</Text>
            <Switch value={pushEnabled} onValueChange={setPushEnabled} />
          </View>
        </BlurView>

        {/* Legal */}
        <BlurView intensity={70} tint={theme === "dark" ? "dark" : "light"} style={styles.card}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <TouchableOpacity style={styles.linkRow}>
            <Text style={styles.link}>Terms of Service</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkRow}>
            <Text style={styles.link}>Privacy Policy</Text>
          </TouchableOpacity>
        </BlurView>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveBtn} onPress={save}>
          <Text style={styles.saveTxt}>Save Changes</Text>
        </TouchableOpacity>

        {/* Footer Logo */}
        <View style={styles.footerWrap}>
          <Image
            source={require("@assets/images/logo.png")}
            style={styles.footerLogo}
            resizeMode="contain"
          />
          <Text style={styles.footerBrand}>[YourNewBrandName]</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { ...fonts.h1, marginBottom: spacing.l },
  card: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: spacing.l,
    padding: spacing.m,
  },
  sectionTitle: {
    ...fonts.small,
    marginBottom: spacing.s,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.m,
  },
  label: { ...fonts.body },
  link: { color: colors.primary, fontWeight: "600" },
  linkRow: { paddingVertical: spacing.s },

  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: spacing.m,
    backgroundColor: colors.divider,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: spacing.m,
    backgroundColor: colors.divider,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTxt: { ...fonts.h2, color: colors.subtext },

  input: {
    borderRadius: 12,
    padding: spacing.m,
    marginTop: spacing.s,
    backgroundColor: colors.surface,
    color: colors.text,
  },

  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: spacing.m,
    alignItems: "center",
    marginTop: spacing.l,
  },
  saveTxt: { color: "#fff", fontWeight: "700", fontSize: 16 },

  footerWrap: { marginTop: spacing.l, alignItems: "center" },
  footerLogo: { height: 40, width: 140, opacity: 0.9 },
  footerBrand: { fontSize: 14, color: "#6B7280", marginTop: 4, fontWeight: "600" },
});
