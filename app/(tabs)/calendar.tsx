import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { colors, spacing, fonts } from "../../src/theme";

type EventType = "meeting" | "sold" | "reminder" | "custom";
const EVENTS_KEY = "ohai:events";

export default function CalendarScreen() {
  const router = useRouter();
  const [events, setEvents] = useState<Record<string, EventType[]>>({});
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [viewMode, setViewMode] = useState<"month" | "week">("month");

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(EVENTS_KEY);
      if (raw) setEvents(JSON.parse(raw));
    })();
  }, []);

  useEffect(() => {
    (async () => {
      await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(events));
    })();
  }, [events]);

  const handleDayPress = (day: DateData) => setSelectedDate(day.dateString);

  const addEvent = (type: EventType) => {
    if (!selectedDate) return;
    setEvents((prev) => {
      const prevEvents = prev[selectedDate] || [];
      return { ...prev, [selectedDate]: [...prevEvents, type] };
    });
  };

  const clearEvents = () => {
    if (!selectedDate) return;
    setEvents((prev) => {
      const updated = { ...prev };
      delete updated[selectedDate];
      return updated;
    });
  };

  const markedDates = Object.keys(events).reduce(
    (acc, date) => {
      acc[date] = { marked: true, dotColor: "#3B82F6" };
      return acc;
    },
    {} as Record<string, any>
  );

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Calendar</Text>
        <TouchableOpacity onPress={() => router.push("/(tabs)/settings")}>
          <Image
            source={require("../../assets/images/profile.png")}
            style={styles.avatar}
          />
        </TouchableOpacity>
      </View>

      {/* Segmented Control */}
      <View style={styles.segmentWrap}>
        {["month", "week"].map((mode) => (
          <TouchableOpacity
            key={mode}
            style={[
              styles.segment,
              viewMode === mode && styles.segmentActive,
            ]}
            onPress={() => setViewMode(mode as "month" | "week")}
          >
            <Text
              style={[
                styles.segmentTxt,
                viewMode === mode && styles.segmentTxtActive,
              ]}
            >
              {mode === "month" ? "Month" : "Week"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {viewMode === "month" ? (
          <>
            <Calendar
              onDayPress={handleDayPress}
              markedDates={{
                ...markedDates,
                ...(selectedDate
                  ? {
                      [selectedDate]: {
                        selected: true,
                        marked: true,
                        dotColor: "#3B82F6",
                      },
                    }
                  : {}),
              }}
              theme={{
                selectedDayBackgroundColor: "#3B82F6",
                todayTextColor: "#EF4444",
              }}
            />

            {selectedDate ? (
              <View style={styles.eventsWrap}>
                <Text style={styles.subTitle}>
                  {selectedDate} — Events
                </Text>

                {/* Add Event Buttons */}
                <View style={styles.btnRow}>
                  <EventButton type="meeting" onPress={() => addEvent("meeting")} />
                  <EventButton type="reminder" onPress={() => addEvent("reminder")} />
                  <EventButton type="sold" onPress={() => addEvent("sold")} />
                  <EventButton type="custom" onPress={() => addEvent("custom")} />
                </View>

                {/* Events List */}
                <View style={styles.eventList}>
                  {events[selectedDate]?.length ? (
                    events[selectedDate].map((e, idx) => (
                      <View key={idx} style={[styles.eventPill, pillColors[e]]}>
                        <Text style={styles.eventTxt}>{e}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.noEvents}>No events yet.</Text>
                  )}
                </View>

                <TouchableOpacity style={styles.clearBtn} onPress={clearEvents}>
                  <Text style={styles.clearTxt}>Clear Events</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.hint}>Tap on a date to add events</Text>
            )}
          </>
        ) : (
          <View style={styles.weekWrap}>
            <Text style={styles.subTitle}>This Week</Text>
            {Object.keys(events).length ? (
              Object.entries(events).map(([date, evts]) => (
                <View key={date} style={styles.weekRow}>
                  <Text style={styles.weekDate}>{date}</Text>
                  <View style={styles.weekEvents}>
                    {evts.map((e, i) => (
                      <View key={i} style={[styles.eventPill, pillColors[e]]}>
                        <Text style={styles.eventTxt}>{e}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noEvents}>No events scheduled.</Text>
            )}
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
    </View>
  );
}

function EventButton({ type, onPress }: { type: EventType; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.addBtn, pillColors[type]]} onPress={onPress}>
      <Text style={styles.addTxt}>+ {type}</Text>
    </TouchableOpacity>
  );
}

const pillColors: Record<EventType, any> = {
  meeting: { backgroundColor: "#3B82F6" },
  reminder: { backgroundColor: "#8B5CF6" },
  sold: { backgroundColor: "#10B981" },
  custom: { backgroundColor: "#FACC15" },
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.m,
  },
  title: { ...fonts.h1 },
  avatar: { width: 36, height: 36, borderRadius: 18 },

  segmentWrap: {
    flexDirection: "row",
    marginHorizontal: spacing.m,
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: spacing.m,
  },
  segment: { flex: 1, padding: 10, alignItems: "center" },
  segmentActive: { backgroundColor: colors.primary },
  segmentTxt: { ...fonts.body, color: "#6B7280" },
  segmentTxtActive: { ...fonts.body, color: "#fff", fontWeight: "700" },

  eventsWrap: { padding: spacing.m },
  subTitle: { ...fonts.h2, marginBottom: spacing.s },

  btnRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: spacing.m },
  addBtn: {
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 6,
  },
  addTxt: { color: "#fff", fontWeight: "600" },

  eventList: { marginTop: spacing.s, flexDirection: "row", flexWrap: "wrap", gap: 6 },
  eventPill: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  eventTxt: { color: "#fff", fontSize: 12 },

  clearBtn: {
    backgroundColor: "#EF4444",
    padding: 10,
    borderRadius: 8,
    marginTop: spacing.m,
    alignItems: "center",
  },
  clearTxt: { color: "#fff", fontWeight: "700" },

  hint: { textAlign: "center", color: "#6B7280", marginTop: 20 },

  weekWrap: { padding: spacing.m },
  weekRow: { marginBottom: spacing.m },
  weekDate: { fontWeight: "600", marginBottom: 4 },
  weekEvents: { flexDirection: "row", flexWrap: "wrap", gap: 6 },

  noEvents: { color: "#6B7280", marginTop: 8 },

  footer: { marginTop: spacing.l, alignItems: "center" },
  footerLogo: { height: 40, width: 140, opacity: 0.9 },
  footerBrand: { fontSize: 14, color: "#6B7280", marginTop: 4, fontWeight: "600" },
});
