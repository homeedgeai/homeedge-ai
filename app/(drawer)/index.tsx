// app/(drawer)/index.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  Alert,
  Animated,
  Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

// 🔐 Firebase
import { auth, db } from "../../firebaseConfig";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

type EventType = "meeting" | "sold" | "reminder" | "custom";
type EventsMap = Record<string, EventType[]>;
const EVENTS_KEY = "ohai:events"; // matches calendar.tsx

type PlatformKey = "instagram" | "facebook" | "tiktok" | "linkedin";
type SocialMetrics = Record<
  PlatformKey,
  { followers: number; engagement: number; lastPostReach: number }
>;
const SOCIAL_METRICS_KEY = "ohai:social:metrics"; // optional override

export default function DashboardScreen() {
  const router = useRouter();
  const [agentName, setAgentName] = useState("Agent");
  const [profileUri, setProfileUri] = useState<string | null>(null);
  const [events, setEvents] = useState<EventsMap>({});
  const [social, setSocial] = useState<SocialMetrics>({
    instagram: { followers: 2310, engagement: 3.8, lastPostReach: 1240 },
    facebook: { followers: 4120, engagement: 2.1, lastPostReach: 980 },
    tiktok: { followers: 1580, engagement: 5.2, lastPostReach: 3100 },
    linkedin: { followers: 820, engagement: 1.4, lastPostReach: 210 },
  });

  // Animations
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    (async () => {
      // ── Load Firebase profile (authoritative) ──────────────────────────────
      const u = auth.currentUser;
      if (u) {
        try {
          const ref = doc(db, "users", u.uid);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            const data: any = snap.data();
            if (data?.name) setAgentName(String(data.name));
            else if (u.displayName) setAgentName(u.displayName);
            if (data?.avatar) setProfileUri(String(data.avatar));
          } else {
            // fallback to Auth displayName if Firestore profile not created yet
            if (u.displayName) setAgentName(u.displayName);
          }
        } catch (e) {
          console.warn("Profile load error:", e);
        }
      } else {
        // Legacy fallback: your existing local storage keys
        const legacyUser = await AsyncStorage.getItem("ohai:user");
        if (legacyUser) {
          try {
            const parsed = JSON.parse(legacyUser);
            setAgentName(parsed.name || "Agent");
          } catch {}
        }
        const p = await AsyncStorage.getItem("ohai:profile");
        if (p) {
          try {
            const parsedProfile = JSON.parse(p);
            if (parsedProfile.avatar) setProfileUri(parsedProfile.avatar);
          } catch {}
        }
      }

      // ── Initial events & social (your original logic) ──────────────────────
      const rawEvents = await AsyncStorage.getItem(EVENTS_KEY);
      if (rawEvents) {
        try {
          setEvents(JSON.parse(rawEvents));
        } catch {}
      }

      const rawSocial = await AsyncStorage.getItem(SOCIAL_METRICS_KEY);
      if (rawSocial) {
        try {
          const parsed = JSON.parse(rawSocial);
          setSocial((s) => ({ ...s, ...parsed }));
        } catch {}
      }

      // ── Entrance animation ─────────────────────────────────────────────────
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(slide, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    })();
  }, []);

  // 🔄 Refresh events whenever Dashboard regains focus (coming back from Calendar)
  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        try {
          const raw = await AsyncStorage.getItem(EVENTS_KEY);
          if (raw) setEvents(JSON.parse(raw));
        } catch {}
      })();
    }, [])
  );

  const upcoming = useMemo(() => getUpcomingEvents(events, 3), [events]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn("Firebase signOut failed; continuing fallback", e);
    }
    // legacy local cleanup for older flows (harmless if not present)
    await AsyncStorage.removeItem("ohai:user");
    Alert.alert("Logged out", "You’ve been signed out.");
    router.replace("/login");
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Background: glossy white -> soft gold -> warm white */}
      <LinearGradient
        colors={["#FFFFFF", "#FFF6E5", "#FFF0CC"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* very subtle top shine */}
      <LinearGradient
        colors={["rgba(255,255,255,0.9)", "rgba(255,255,255,0.0)"]}
        style={{ position: "absolute", top: 0, left: 0, right: 0, height: 140 }}
      />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Header (cohesive with light theme) */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcome}>Welcome back, {agentName} 👋</Text>
            <Text style={styles.subtitle}>Here’s your daily overview</Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity onPress={() => router.push("/(drawer)/settings")}>
              <Image
                source={
                  profileUri
                    ? { uri: profileUri }
                    : require("../../assets/images/profile.png")
                }
                style={styles.avatar}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={{ marginLeft: 10 }}>
              <Ionicons name="log-out-outline" size={24} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <Animated.View
          style={{
            opacity: fade,
            transform: [{ translateY: slide }],
            paddingHorizontal: 18,
            marginTop: 4,
          }}
        >
          <View style={styles.quickRow}>
            <QuickButton
              label="Listings"
              icon="briefcase-outline"
              onPress={() => router.push("/(drawer)/listings")}
            />
            <QuickButton
              label="Calendar"
              icon="calendar-outline"
              onPress={() => router.push("/(drawer)/calendar")}
            />
            <QuickButton
              label="Performance"
              icon="trending-up-outline"
              onPress={() => router.push("/(drawer)/performance")}
            />
          </View>
        </Animated.View>

        {/* Upcoming Events */}
        <Animated.View
          style={{
            opacity: fade,
            transform: [{ translateY: slide }],
            marginTop: 18,
            paddingHorizontal: 18,
          }}
        >
          <SectionHeader
            title="Today’s Events"
            actionLabel="View Calendar"
            onAction={() => router.push("/(drawer)/calendar")}
          />
          <View style={styles.eventsCard}>
            {upcoming.length ? (
              upcoming.map((e, i) => <EventRow key={i} date={e.date} type={e.type} />)
            ) : (
              <Text style={styles.emptyText}>No events scheduled. Add one in Calendar.</Text>
            )}
          </View>
        </Animated.View>

        {/* Social Performance */}
        <Animated.View
          style={{
            opacity: fade,
            transform: [{ translateY: slide }],
            marginTop: 18,
            paddingHorizontal: 18,
          }}
        >
          <SectionHeader title="Social Performance" />
          <View style={styles.socialGrid}>
            <PlatformCard
              platform="instagram"
              color="#E1306C"
              gradient={["#F58529", "#DD2A7B"]}
              icon="logo-instagram"
              metrics={social.instagram}
            />
            <PlatformCard
              platform="facebook"
              color="#1877F2"
              gradient={["#4E8EF7", "#1877F2"]}
              icon="logo-facebook"
              metrics={social.facebook}
            />
            <PlatformCard
              platform="tiktok"
              color="#25F4EE"
              gradient={["#25F4EE", "#000000"]}
              icon="musical-notes-outline"
              metrics={social.tiktok}
              iconColor="#000"
            />
            <PlatformCard
              platform="linkedin"
              color="#0A66C2"
              gradient={["#66A6FF", "#0A66C2"]}
              icon="logo-linkedin"
              metrics={social.linkedin}
            />
          </View>
        </Animated.View>
      </ScrollView>

      {/* Smart Map FAB (smaller, lighter) */}
      <TouchableOpacity
        style={styles.mapFab}
        onPress={() => router.push("/(drawer)/map")}
        activeOpacity={0.9}
      >
        <Ionicons name="map-outline" size={22} color="#111827" />
        <Text style={styles.mapText}>Smart Map</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ----------------------- Helpers & small components ----------------------- */

function QuickButton({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: any;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.quickButton} onPress={onPress}>
      <Ionicons name={icon} size={22} color="#111827" />
      <Text style={styles.quickText}>{label}</Text>
    </TouchableOpacity>
  );
}

function SectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {actionLabel && onAction ? (
        <TouchableOpacity onPress={onAction} style={styles.sectionAction}>
          <Text style={styles.sectionActionText}>{actionLabel}</Text>
          <Ionicons name="chevron-forward" size={16} color="#1D4ED8" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const pillColors: Record<EventType, string> = {
  meeting: "#007AFF",
  reminder: "#8B5CF6",
  sold: "#10B981",
  custom: "#F59E0B",
};

function EventRow({ date, type }: { date: string; type: EventType }) {
  const color = pillColors[type];
  return (
    <View style={styles.eventRow}>
      <View style={[styles.eventPill, { backgroundColor: color }]}>
        <Text style={styles.eventPillTxt}>{type}</Text>
      </View>
      <Text style={styles.eventDate}>{formatDate(date)}</Text>
    </View>
  );
}

function PlatformCard({
  platform,
  color,
  gradient,
  icon,
  metrics,
  iconColor,
}: {
  platform: PlatformKey;
  color: string;
  gradient: string[];
  icon: any;
  metrics: { followers: number; engagement: number; lastPostReach: number };
  iconColor?: string;
}) {
  return (
    <View style={styles.platformCard}>
      {/* glow */}
      <LinearGradient
        colors={gradient}
        style={styles.platformGlow}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={styles.platformHeader}>
        <Ionicons name={icon} size={18} color={iconColor || "#fff"} />
        <Text style={[styles.platformTitle, { color }]}>{cap(platform)}</Text>
      </View>
      <View style={styles.metricRow}>
        <Metric label="Followers" value={metrics.followers} />
        <Metric label="Engagement" value={`${metrics.engagement}%`} />
      </View>
      <View style={[styles.metricRow, { marginTop: 6 }]}>
        <Metric label="Last Reach" value={formatNumber(metrics.lastPostReach)} />
      </View>
    </View>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function getUpcomingEvents(map: EventsMap, limit = 3) {
  const today = new Date();
  const arr: { date: string; type: EventType }[] = [];
  Object.entries(map).forEach(([date, types]) => {
    types.forEach((t) => arr.push({ date, type: t }));
  });
  // Keep only today+future, sort by date asc
  const filtered = arr
    .filter((e) => new Date(e.date).getTime() >= startOfDay(today).getTime())
    .sort((a, b) => +new Date(a.date) - +new Date(b.date));
  return filtered.slice(0, limit);
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const formatNumber = (n: number) =>
  n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + "M" : n >= 1_000 ? (n / 1_000).toFixed(1) + "K" : String(n);

function formatDate(isoLike: string) {
  try {
    const d = new Date(isoLike);
    return d.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } catch {
    return isoLike;
  }
}

/* --------------------------------- Styles --------------------------------- */

const cardBg = "rgba(255,255,255,0.72)";
const border = "rgba(17,24,39,0.08)";
const textMain = "#111827";
const textMuted = "#6B7280";

const styles = StyleSheet.create({
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcome: { fontSize: 22, fontWeight: "800", color: textMain },
  subtitle: { fontSize: 14, color: textMuted, marginTop: 4 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(17,24,39,0.12)",
  },

  quickRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  quickButton: {
    flex: 1,
    backgroundColor: cardBg,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: border,
  },
  quickText: { marginTop: 6, fontWeight: "600", color: textMain },

  sectionHeader: {
    paddingHorizontal: 2,
    paddingVertical: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: textMain },
  sectionAction: { flexDirection: "row", alignItems: "center" },
  sectionActionText: { color: "#1D4ED8", fontWeight: "700", marginRight: 2 },

  eventsCard: {
    backgroundColor: cardBg,
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: border,
  },
  eventRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  eventPill: { borderRadius: 14, paddingHorizontal: 10, paddingVertical: 4, marginRight: 10 },
  eventPillTxt: { color: "#fff", fontWeight: "700", fontSize: 12, textTransform: "capitalize" },
  eventDate: { color: textMain, fontWeight: "600" },
  emptyText: { color: textMuted },

  socialGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },
  platformCard: {
    width: "48%",
    borderRadius: 18,
    padding: 12,
    overflow: "hidden",
    backgroundColor: cardBg,
    borderWidth: 1,
    borderColor: border,
  },
  platformGlow: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.18,
    borderRadius: 18,
  },
  platformHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  platformTitle: {
    fontSize: 14,
    fontWeight: "800",
  },
  metricRow: {
    flexDirection: "row",
    gap: 10,
  },
  metricLabel: { color: textMuted, fontSize: 12 },
  metricValue: { color: textMain, fontSize: 16, fontWeight: "800" },

  mapFab: {
    position: "absolute",
    right: 22,
    bottom: 26,
    backgroundColor: "#FDE68A",
    borderRadius: 28,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(17,24,39,0.12)",
  },
  mapText: { color: "#111827", fontSize: 14, fontWeight: "800", marginLeft: 6 },
});
