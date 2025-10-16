import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { usePerformanceContext } from "../../src/context/PerformanceContext";
import { colors, spacing, fonts } from "../../src/theme";
import { getProfile, Profile } from "../../lib/profile";

const THREADS_KEY = "ohai:threads";
const LISTINGS_KEY = "ohai:listings";
const EVENTS_KEY = "ohai:events";

export default function DashboardScreen() {
  const router = useRouter();
  const { performance } = usePerformanceContext();

  const [listings, setListings] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [events, setEvents] = useState<Record<string, string[]>>({});
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const rawListings = await AsyncStorage.getItem(LISTINGS_KEY);
        const rawLeads = await AsyncStorage.getItem(THREADS_KEY);
        const rawEvents = await AsyncStorage.getItem(EVENTS_KEY);

        setListings(rawListings ? JSON.parse(rawListings) : []);
        setLeads(rawLeads ? JSON.parse(rawLeads) : []);
        setEvents(rawEvents ? JSON.parse(rawEvents) : {});

        const p = await getProfile();
        setProfile(p);
      } catch (e) {
        console.error("❌ Failed to load dashboard data", e);
      }
    })();
  }, []);

  return (
    <SafeAreaView style={styles.root}>
      {/* Background Stripes */}
      <View style={styles.background}>
        <View style={[styles.stripe, { backgroundColor: "#3B82F6" }]} />
        <View style={[styles.stripe, { backgroundColor: "#FACC15", top: 120 }]} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.hello}>
              Welcome back{profile?.name ? `, ${profile.name}` : ""} 👋
            </Text>
            <Text style={styles.title}>Your Dashboard</Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/(tabs)/settings")}>
            {profile?.avatar ? (
              <Image source={{ uri: profile.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarTxt}>
                  {profile?.name
                    ? profile.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                    : "U"}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* KPI Cards */}
        <View style={styles.kpiRow}>
          <KpiCard icon="eye-outline" label="Views" value={performance.totalViews} accent="#3B82F6" />
          <KpiCard icon="finger-print-outline" label="Clicks" value={performance.totalClicks} accent="#10B981" />
        </View>
        <View style={styles.kpiRow}>
          <KpiCard
            icon="trending-up-outline"
            label="Conversion"
            value={`${performance.conversionRate.toFixed(1)}%`}
            accent="#F59E0B"
          />
          <KpiCard
            icon="home-outline"
            label="Listings"
            value={listings.length}
            accent="#8B5CF6"
            onPress={() => router.push("/listings/generate")}
          />
        </View>

        {/* Quick Access */}
        <Section title="Quick Access">
          <View style={styles.quickRow}>
            <QuickStat icon="people-outline" label="Leads" value={leads.length} onPress={() => router.push("/inbox")} />
            <QuickStat icon="home-outline" label="Listings" value={listings.length} onPress={() => router.push("/listings/generate")} />
            <QuickStat icon="calendar-outline" label="Events" value={Object.keys(events).length} onPress={() => router.push("/calendar")} />
          </View>
        </Section>

        {/* Latest Listing */}
        <Section title="Latest Listing">
          {listings.length > 0 ? (
            <View>
              <Image source={{ uri: listings[listings.length - 1].image }} style={styles.previewImg} />
              <Text style={styles.previewTitle}>${listings[listings.length - 1].price}</Text>
              <Text style={styles.previewSubtitle}>{listings[listings.length - 1].address}</Text>
            </View>
          ) : (
            <Text style={styles.muted}>No listings yet.</Text>
          )}
        </Section>

        {/* Latest Leads */}
        <Section title="Latest Leads">
          {leads.slice(0, 5).map((l: any, idx: number) => (
            <View key={idx} style={styles.listRow}>
              <Ionicons name="person-circle-outline" size={18} color="#10B981" />
              <Text style={styles.listRowText}>
                {l.name || "Lead"} · {l.status || "New"}
              </Text>
            </View>
          ))}
          {leads.length === 0 && <Text style={styles.muted}>No leads yet.</Text>}
        </Section>

        {/* Upcoming Events */}
        <Section title="Upcoming Events">
          {Object.keys(events).length ? (
            Object.entries(events)
              .slice(0, 5)
              .map(([date, types], idx) => (
                <View key={idx} style={styles.listRow}>
                  <Ionicons name="calendar-outline" size={18} color="#3B82F6" />
                  <Text style={styles.listRowText}>
                    {Array.isArray(types) ? types.join(", ") : String(types)} · {date}
                  </Text>
                </View>
              ))
          ) : (
            <Text style={styles.muted}>No upcoming events.</Text>
          )}
        </Section>

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

function KpiCard({ icon, label, value, accent, onPress }: { icon: any; label: string; value: number | string; accent: string; onPress?: () => void }) {
  return (
    <TouchableOpacity style={styles.kpiCard} onPress={onPress}>
      <View style={[styles.kpiIconWrap, { backgroundColor: accent + "20" }]}>
        <Ionicons name={icon} size={18} color={accent} />
      </View>
      <Text style={styles.kpiValue}>{String(value)}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View>{children}</View>
    </View>
  );
}

function QuickStat({ icon, label, value, onPress }: { icon: any; label: string; value: number; onPress?: () => void }) {
  return (
    <TouchableOpacity style={styles.quickStat} onPress={onPress}>
      <Ionicons name={icon} size={16} color="#111827" />
      <Text style={styles.quickVal}>{value}</Text>
      <Text style={styles.quickLbl}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F9FAFB" },

  background: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    overflow: "hidden",
  },
  stripe: {
    position: "absolute",
    left: -100,
    right: -100,
    height: 120,
    transform: [{ rotate: "-10deg" }],
    opacity: 0.2,
  },

  header: {
    paddingHorizontal: spacing.m,
    paddingTop: spacing.s,
    paddingBottom: spacing.s,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  hello: { fontSize: 14, color: "#6B7280" },
  title: { fontSize: 22, fontWeight: "800", color: "#111827" },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  avatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTxt: { color: "#111827", fontWeight: "700" },

  kpiRow: { flexDirection: "row", gap: 12, paddingHorizontal: spacing.m, marginTop: 10 },
  kpiCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  kpiIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  kpiValue: { fontSize: 20, fontWeight: "800", color: "#111827" },
  kpiLabel: { fontSize: 12, color: "#6B7280", marginTop: 2 },

  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginTop: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginHorizontal: spacing.m,
  },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#111827", marginBottom: 8 },

  previewImg: { width: "100%", height: 160, borderRadius: 12, marginBottom: spacing.s },
  previewTitle: { ...fonts.h2, color: colors.primary },
  previewSubtitle: { ...fonts.body, color: colors.subtext },
  muted: { color: "#6B7280" },

  quickRow: { flexDirection: "row", justifyContent: "space-between" },
  quickStat: { alignItems: "center", flex: 1 },
  quickVal: { fontSize: 18, fontWeight: "800", marginTop: 6, color: "#111827" },
  quickLbl: { fontSize: 12, color: "#6B7280", marginTop: 2 },

  listRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6 },
  listRowText: { color: "#111827", fontSize: 14 },

  footer: { marginTop: spacing.l, alignItems: "center" },
  footerLogo: { height: 40, width: 140, opacity: 0.9 },
  footerBrand: { fontSize: 14, color: "#6B7280", marginTop: 4, fontWeight: "600" },
});
