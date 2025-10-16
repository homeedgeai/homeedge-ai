// app/settings.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Switch,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { getProfile, saveProfile, Profile } from "../lib/profile";
import { useColorScheme } from "../hooks/useColorScheme";

export default function SettingsScreen() {
  const [profile, setProfile] = useState<Profile>({
    name: "Agent",
    email: "",
    phone: "",
    photo: "",
    autoReply: false,
    autoReplyText: "Hello, thank you for reaching out. I’ll get back to you soon.",
  });

  const [saving, setSaving] = useState(false);
  const colorScheme = useColorScheme();

  useEffect(() => {
    (async () => {
      const p = await getProfile();
      if (p) setProfile(p);
    })();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      setProfile((p) => ({ ...p, photo: result.assets[0].uri }));
    }
  };

  const save = async () => {
    setSaving(true);
    await saveProfile(profile);
    setSaving(false);
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingBottom: 60 }}>
      <Text style={styles.heading}>⚙️ Settings</Text>

      {/* Profile Picture */}
      <TouchableOpacity onPress={pickImage} style={styles.photoWrapper}>
        <Image
          source={
            profile.photo ? { uri: profile.photo } : require("../assets/images/profile.png")
          }
          style={styles.photo}
        />
        <Text style={styles.photoHint}>Change Profile Picture</Text>
      </TouchableOpacity>

      {/* Name */}
      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={profile.name}
        onChangeText={(v) => setProfile({ ...profile, name: v })}
      />

      {/* Email */}
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={profile.email}
        onChangeText={(v) => setProfile({ ...profile, email: v })}
        keyboardType="email-address"
      />

      {/* Phone */}
      <Text style={styles.label}>Phone</Text>
      <TextInput
        style={styles.input}
        value={profile.phone}
        onChangeText={(v) => setProfile({ ...profile, phone: v })}
        keyboardType="phone-pad"
      />

      {/* Appearance */}
      <View style={styles.toggleRow}>
        <Text style={styles.label}>Dark Mode</Text>
        <Switch
          value={colorScheme === "dark"}
          onValueChange={() => {
            // Just placeholder, wired when theme context is added
          }}
        />
      </View>

      {/* Auto Reply */}
      <View style={styles.toggleRow}>
        <Text style={styles.label}>Auto-Reply</Text>
        <Switch
          value={profile.autoReply}
          onValueChange={(v) => setProfile({ ...profile, autoReply: v })}
        />
      </View>
      {profile.autoReply && (
        <>
          <Text style={styles.label}>Auto-Reply Message</Text>
          <TextInput
            style={[styles.input, { height: 80 }]}
            value={profile.autoReplyText}
            onChangeText={(v) => setProfile({ ...profile, autoReplyText: v })}
            multiline
          />
        </>
      )}

      {/* Save Button */}
      <TouchableOpacity style={styles.saveBtn} onPress={save} disabled={saving}>
        <Text style={styles.saveTxt}>{saving ? "Saving..." : "Save"}</Text>
      </TouchableOpacity>

      {/* Logo */}
      <View style={styles.footer}>
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logo}
        />
        <Text style={styles.footerTxt}>OpenHouse AI</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff", padding: 16 },
  heading: { fontSize: 24, fontWeight: "800", marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "600", marginTop: 16, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    backgroundColor: "#F9FAFB",
  },
  photoWrapper: { alignItems: "center", marginBottom: 20 },
  photo: { width: 80, height: 80, borderRadius: 40, marginBottom: 6 },
  photoHint: { fontSize: 12, color: "#3B82F6" },

  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },

  saveBtn: {
    marginTop: 24,
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  saveTxt: { color: "#fff", fontWeight: "700", fontSize: 16 },

  footer: { marginTop: 40, alignItems: "center" },
  logo: { width: 40, height: 40, resizeMode: "contain", marginBottom: 6 },
  footerTxt: { fontSize: 14, fontWeight: "600", color: "#555" },
});
