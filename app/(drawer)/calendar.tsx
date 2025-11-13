// app/(drawer)/calendar.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useFocusEffect } from "expo-router";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Toast from "react-native-toast-message";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  getFirestore,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";

type EventType = "meeting" | "sold" | "reminder" | "custom";
const EVENTS_KEY = "ohai:events";
const FIREBASE_USER_ID = "demoUser123"; // Replace with real user auth later

export default function CalendarScreen() {
  const router = useRouter();
  const [events, setEvents] = useState<Record<string, EventType[]>>({});
  const [selectedDate, setSelectedDate] = useState<string>("");

  // 🔄 Load events from local + Firebase
  const loadEvents = async () => {
    try {
      // 1. local cache
      const localRaw = await AsyncStorage.getItem(EVENTS_KEY);
      if (localRaw) setEvents(JSON.parse(localRaw));

      // 2. Firestore
      const ref = doc(db, "events", FIREBASE_USER_ID);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        if (data?.records) setEvents(data.records);
        await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(data.records)); // cache it
      }
    } catch (e) {
      console.warn("Failed to load events", e);
    }
  };

  // Load on mount
  useEffect(() => {
    loadEvents();
  }, []);

  // 💾 Save events (local + Firebase)
  const saveEvents = async (newEvents: Record<string, EventType[]>) => {
    try {
      await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(newEvents));
      await setDoc(doc(db, "events", FIREBASE_USER_ID), { records: newEvents });
    } catch (e) {
      console.warn("Failed to save events", e);
    }
  };

  useEffect(() => {
    saveEvents(events);
  }, [events]);

  // 🔁 Reload when returning from other screens
  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, [])
  );

  const handleDayPress = (day: DateData) => setSelectedDate(day.dateString);

  const addEvent = async (type: EventType) => {
    if (!selectedDate) return;
    const updated = {
      ...events,
      [selectedDate]: [...(events[selectedDate] || []), type],
    };
    setEvents(updated);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Toast.show({
      type: "success",
      text1: `${type.charAt(0).toUpperCase() + type.slice(1)} added`,
      position: "bottom",
    });
  };

  const clearEvents = async () => {
    if (!selectedDate) return;
    const updated = { ...events };
    delete updated[selectedDate];
    setEvents(updated);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Toast.show({
      type: "info",
      text1: "All events cleared",
      position: "bottom",
    });
  };

  const markedDates = Object.keys(events).reduce((acc, date) => {
    const eventCount = events[date].length;
    acc[date] = {
      marked: true,
      dotColor: eventCount > 2 ? "#FCD34D" : "#007AFF",
    };
    return acc;
  }, {} as Record<string, any>);

  return (
    <LinearGradient
      colors={["#F9FAFB", "#E5E7EB"]}
      style={styles.root}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Calendar</Text>
          <TouchableOpacity
            onPress={() => {
              if (router?.canGoBack?.()) router.back();
              else router?.push?.("/(drawer)");
            }}
            style={styles.backBtn}
          >
            <Ionicons name="chevron-back" size={22} color="#007AFF" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>

        {/* Calendar */}
        <View style={styles.calendarWrap}>
          <Calendar
            theme={{
              backgroundColor: "transparent",
              calendarBackground: "transparent",
              textSectionTitleColor: "#6B7280",
              selectedDayBackgroundColor: "#007AFF",
              selectedDayTextColor: "#fff",
              todayTextColor: "#2563EB",
              dayTextColor: "#111827",
              arrowColor: "#007AFF",
              monthTextColor: "#111827",
              textMonthFontWeight: "700",
              textDayFontSize: 16,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 13,
            }}
            onDayPress={handleDayPress}
            markedDates={{
              ...markedDates,
              ...(selectedDate
                ? {
                    [selectedDate]: {
                      selected: true,
                      marked: true,
                      dotColor: "#007AFF",
                    },
                  }
                : {}),
            }}
          />
        </View>

        {/* Event Details */}
        {selectedDate && (
          <BlurView
            intensity={Platform.OS === "ios" ? 40 : 80}
            tint="light"
            style={styles.card}
          >
            <Text style={styles.subTitle}>{selectedDate} — Your Events</Text>

            <View style={styles.btnRow}>
              <EventButton type="meeting" onPress={() => addEvent("meeting")} />
              <EventButton type="reminder" onPress={() => addEvent("reminder")} />
              <EventButton type="sold" onPress={() => addEvent("sold")} />
              <EventButton type="custom" onPress={() => addEvent("custom")} />
            </View>

            <View style={styles.eventList}>
              {events[selectedDate]?.length ? (
                events[selectedDate].map((e, i) => (
                  <View key={i} style={[styles.eventPill, pillColors[e]]}>
                    <Text style={styles.eventTxt}>{e}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noEvents}>No events yet.</Text>
              )}
            </View>

            <TouchableOpacity style={styles.clearBtn} onPress={clearEvents}>
              <Text style={styles.clearTxt}>Clear All</Text>
            </TouchableOpacity>
          </BlurView>
        )}
      </ScrollView>

      <Toast />
    </LinearGradient>
  );
}

function EventButton({
  type,
  onPress,
}: {
  type: EventType;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={[styles.addBtn, pillColors[type]]} onPress={onPress}>
      <Text style={styles.addTxt}>+ {type}</Text>
    </TouchableOpacity>
  );
}

const pillColors: Record<EventType, any> = {
  meeting: { backgroundColor: "#007AFF" },
  reminder: { backgroundColor: "#8B5CF6" },
  sold: { backgroundColor: "#10B981" },
  custom: { backgroundColor: "#FACC15" },
};

const styles = StyleSheet.create({
  root: { flex: 1, paddingTop: 60 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  title: { fontSize: 34, fontWeight: "700", color: "#111827" },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,122,255,0.08)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  backText: { color: "#007AFF", fontWeight: "600", marginLeft: 4 },
  calendarWrap: {
    borderRadius: 16,
    overflow: "hidden",
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  card: {
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.8)",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  subTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12, color: "#111827" },
  btnRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  addBtn: { borderRadius: 16, paddingVertical: 8, paddingHorizontal: 14 },
  addTxt: { color: "#fff", fontWeight: "600" },
  eventList: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 4 },
  eventPill: { borderRadius: 14, paddingHorizontal: 12, paddingVertical: 5 },
  eventTxt: { color: "#fff", fontSize: 13, fontWeight: "500" },
  clearBtn: {
    backgroundColor: "#EF4444",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 14,
  },
  clearTxt: { color: "#fff", fontWeight: "700" },
  noEvents: { color: "#6B7280", fontSize: 14 },
});
