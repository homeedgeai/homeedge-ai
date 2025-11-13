import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  Linking,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import * as Updates from "expo-updates";
import * as Application from "expo-application";
import * as FileSystem from "expo-file-system";
import * as Localization from "expo-localization";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  enableNetwork,
} from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";
import { signOut, updatePassword } from "firebase/auth";

export default function SettingsScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [profile, setProfile] = useState({ name: "", email: "", avatar: "" });
  const [themeDark, setThemeDark] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [language, setLanguage] = useState(Localization.locale || "en");
  const [availableLangs, setAvailableLangs] = useState<string[]>(["en"]);
  const [savingLang, setSavingLang] = useState(false);

  /** 🧠 Load Profile with Firestore network check */
  const loadProfile = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Not logged in", "Please sign in to edit your profile.");
      return;
    }

    setSyncing(true);
    setLoading(true);

    try {
      const state = await NetInfo.fetch();
      if (!state.isConnected || !state.isInternetReachable) {
        Alert.alert("Offline", "You're currently offline. Try again when connected.");
        return;
      }

      // Try enabling Firestore
      try {
        await enableNetwork(db);
      } catch (err) {
        console.log("⚠️ Firestore already online:", err?.message);
      }

      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        const data = snap.data();
        setProfile({
          name: data.name || user.displayName || "",
          email: user.email || "",
          avatar: data.avatar || user.photoURL || "",
        });
      } else {
        setProfile({
          name: user.displayName || "",
          email: user.email || "",
          avatar: user.photoURL || "",
        });
      }
    } catch (err: any) {
      console.error("Profile load error:", err);
      if (err.message?.includes("offline")) {
        Alert.alert("Network Error", "Firestore is still offline — retrying in 3 seconds...");
        setTimeout(loadProfile, 3000);
      } else {
        Alert.alert("Error", "Failed to load profile.");
      }
    } finally {
      setSyncing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();

    // Safe localization setup
    try {
      const langs = Localization.getLocales()
        ?.map((l) => l.languageCode)
        .filter(Boolean) as string[];
      setAvailableLangs([...new Set(langs.length ? langs : ["en"])]);
    } catch (e) {
      console.log("Localization error:", e);
      setAvailableLangs(["en"]);
    }
  }, []);

  /** 🔔 Notifications setup */
  useEffect(() => {
    (async () => {
      const settings = await Notifications.getPermissionsAsync();
      setNotificationsEnabled(
        settings.granted ||
          settings.ios?.status ===
            Notifications.IosAuthorizationStatus.PROVISIONAL
      );
    })();
  }, []);

  const toggleNotifications = async () => {
    if (notificationsEnabled) {
      setNotificationsEnabled(false);
      return;
    }
    const { status } = await Notifications.requestPermissionsAsync();
    setNotificationsEnabled(status === "granted");
    if (status !== "granted")
      Alert.alert("Notifications disabled", "Permission not granted.");
  };

  /** 🖼 Avatar picker */
  const pickAvatar = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (res.canceled) return;
    setProfile({ ...profile, avatar: res.assets[0].uri });
  };

  /** 💾 Save Profile */
  const saveProfile = async () => {
    const user = auth.currentUser;
    if (!user) return;
    if (!profile.name.trim()) {
      Alert.alert("Name required");
      return;
    }
    try {
      setSaving(true);
      let avatarUrl = profile.avatar;
      if (avatarUrl && avatarUrl.startsWith("file://")) {
        const storage = getStorage();
        const refPath = ref(storage, `avatars/${user.uid}.jpg`);
        const blob = await (await fetch(profile.avatar)).blob();
        await uploadBytes(refPath, blob);
        avatarUrl = await getDownloadURL(refPath);
      }
      await updateDoc(doc(db, "users", user.uid), {
        name: profile.name.trim(),
        avatar: avatarUrl,
      });
      await Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success
      );
      Alert.alert("✅ Profile Updated");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not update your profile.");
    } finally {
      setSaving(false);
    }
  };

  /** 🔐 Account Actions */
  const handleChangePassword = async () => {
    const user = auth.currentUser;
    if (!user) return Alert.alert("Not logged in");
    Alert.prompt("Change Password", "Enter your new password", async (text) => {
      if (!text) return;
      try {
        await updatePassword(user, text);
        Alert.alert("✅ Password updated successfully.");
      } catch (err: any) {
        Alert.alert("Error", err.message);
      }
    });
  };

  const handleSignOut = async () => {
    await signOut(auth);
    Alert.alert("Signed out", "You’ve been signed out.");
  };

  const handleDeleteAccount = async () => {
    const user = auth.currentUser;
    if (!user) return;
    Alert.alert("Delete Account?", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "users", user.uid));
            await user.delete();
            Alert.alert("Account deleted.");
          } catch (e: any) {
            Alert.alert("Error deleting account.", e.message);
          }
        },
      },
    ]);
  };

  /** 🧹 Clear cache / Language */
  const clearCache = async () => {
    try {
      await FileSystem.deleteAsync(FileSystem.cacheDirectory || "");
      Alert.alert("Cache Cleared ✅");
    } catch {
      Alert.alert("Error", "Failed to clear cache.");
    }
  };

  const changeLanguage = async (lang: string) => {
    try {
      setSavingLang(true);
      await AsyncStorage.setItem("appLanguage", lang);
      setLanguage(lang);
      Alert.alert("Language updated", `App will use: ${lang}`);
    } finally {
      setSavingLang(false);
    }
  };

  const appVersion = Application.nativeApplicationVersion || "1.0.0";

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );

  return (
    <LinearGradient colors={["#FFFFFF", "#EEF4FF"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Settings</Text>

        {/* 👤 Profile */}
        <Card title="Profile">
          <TouchableOpacity style={styles.avatarWrap} onPress={pickAvatar}>
            {profile.avatar ? (
              <Image source={{ uri: profile.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={40} color="#2563EB" />
              </View>
            )}
            <Text style={styles.changeTxt}>Change Photo</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            value={profile.name}
            onChangeText={(t) => setProfile({ ...profile, name: t })}
            placeholder="Your Name"
          />
          <TextInput
            style={[styles.input, { opacity: 0.6 }]}
            value={profile.email}
            editable={false}
          />

          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.6 }]}
            onPress={saveProfile}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveTxt}>Save Changes</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.syncBtn, syncing && { opacity: 0.7 }]}
            onPress={loadProfile}
            disabled={syncing}
          >
            {syncing ? (
              <ActivityIndicator color="#2563EB" />
            ) : (
              <Text style={styles.syncTxt}>Sync from Cloud</Text>
            )}
          </TouchableOpacity>
        </Card>

        {/* ⚙️ Preferences */}
        <Card title="App Preferences">
          <Toggle
            label="Dark Mode"
            value={themeDark}
            onValueChange={() => setThemeDark(!themeDark)}
          />
          <Toggle
            label="Notifications"
            value={notificationsEnabled}
            onValueChange={toggleNotifications}
          />

          <Text style={styles.rowTxt}>Language</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: 8 }}
          >
            {availableLangs.map((lang) => (
              <TouchableOpacity
                key={lang}
                onPress={() => changeLanguage(lang)}
                style={[
                  styles.langBtn,
                  {
                    backgroundColor:
                      language && language.startsWith(lang)
                        ? "#2563EB"
                        : "#E5E7EB",
                  },
                ]}
              >
                {savingLang && language === lang ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text
                    style={{
                      color:
                        language && language.startsWith(lang)
                          ? "#fff"
                          : "#111",
                      fontWeight: "600",
                      textTransform: "uppercase",
                    }}
                  >
                    {lang}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Card>

        {/* 🔐 Account */}
        <Card title="Account">
          <Row icon="key-outline" label="Change Password" onPress={handleChangePassword} />
          <Row icon="log-out-outline" label="Sign Out" color="#EF4444" onPress={handleSignOut} />
          <Row icon="trash-outline" label="Delete Account" color="#EF4444" onPress={handleDeleteAccount} />
        </Card>

        {/* 📜 Legal */}
        <Card title="Privacy & Legal">
          <Row icon="document-text-outline" label="Terms of Service" onPress={() => Linking.openURL("https://homeedgeai.com/terms")} />
          <Row icon="shield-checkmark-outline" label="Privacy Policy" onPress={() => Linking.openURL("https://homeedgeai.com/privacy")} />
        </Card>

        {/* 🧰 System */}
        <Card title="System & Info">
          <Row icon="trash-bin-outline" label="Clear Cache" onPress={clearCache} />
          <Row icon="refresh-outline" label="Restart App" onPress={() => Updates.reloadAsync()} />
          <View style={styles.versionWrap}>
            <Text style={styles.versionTxt}>Version {appVersion}</Text>
          </View>
        </Card>
      </ScrollView>
    </LinearGradient>
  );
}

/* ---------- Components ---------- */
function Card({ title, children }: any) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {children}
    </View>
  );
}
function Toggle({ label, value, onValueChange }: any) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.rowTxt}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} />
    </View>
  );
}
function Row({ icon, label, onPress, color = "#2563EB" }: any) {
  return (
    <TouchableOpacity style={styles.rowBtn} onPress={onPress}>
      <Ionicons name={icon} size={20} color={color} />
      <Text style={[styles.rowTxt, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 100 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 30, fontWeight: "800", color: "#111827", marginBottom: 16, textAlign: "center" },
  card: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: { fontWeight: "700", fontSize: 18, marginBottom: 12, color: "#1F2937" },
  avatarWrap: { alignItems: "center", marginBottom: 16 },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  changeTxt: { color: "#2563EB", marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: "#F9FAFB",
  },
  saveBtn: { backgroundColor: "#2563EB", borderRadius: 10, alignItems: "center", padding: 14, marginTop: 4 },
  saveTxt: { color: "#fff", fontWeight: "700" },
  syncBtn: {
    borderWidth: 1,
    borderColor: "#2563EB",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    width: "100%",
    marginTop: 10,
  },
  syncTxt: { color: "#2563EB", fontWeight: "700", fontSize: 16 },
  rowBtn: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  rowTxt: { fontSize: 15, fontWeight: "500", color: "#111827", marginLeft: 8 },
  toggleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10 },
  langBtn: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8 },
  versionWrap: { alignItems: "center", marginTop: 10 },
  versionTxt: { color: "#6B7280", fontSize: 13 },
});
