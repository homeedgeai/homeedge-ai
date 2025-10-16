// components/EventCalendarWithList.tsx
import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Calendar } from "react-native-calendars";
import { useAppContext } from "../context/AppContext";

interface Props {
  eventColors: Record<string, string>;
  compact?: boolean; // for dashboard (smaller look)
}

export default function EventCalendarWithList({ eventColors, compact }: Props) {
  const { events } = useAppContext();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const markedDates = useMemo(() => {
    const marked: any = {};
    (events || []).forEach((e) => {
      if (e.date) {
        marked[e.date] = {
          marked: true,
          dotColor: eventColors[e.type] || "#3B82F6",
          ...(selectedDate === e.date
            ? { selected: true, selectedColor: "#CCE5FF" }
            : {}),
        };
      }
    });
    return marked;
  }, [events, selectedDate]);

  const displayedEvents = useMemo(() => {
    if (!events) return [];
    if (!selectedDate) return events;
    return events.filter((e) => e.date === selectedDate);
  }, [events, selectedDate]);

  return (
    <View>
      <Calendar
        markedDates={markedDates}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        style={compact ? { borderRadius: 8, overflow: "hidden" } : {}}
        theme={{
          selectedDayBackgroundColor: "#007AFF",
          selectedDayTextColor: "#fff",
          todayTextColor: "#FF3B30",
          dotColor: "#007AFF",
          arrowColor: "#007AFF",
        }}
      />

      {!compact && (
        <View style={{ marginTop: 16 }}>
          <Text style={styles.sectionTitle}>
            {selectedDate ? `Events on ${selectedDate}` : "Upcoming Events"}
          </Text>
          {displayedEvents.length === 0 ? (
            <Text style={styles.placeholder}>No events yet.</Text>
          ) : (
            displayedEvents.map((e) => (
              <View
                key={e.id}
                style={[
                  styles.eventCard,
                  { backgroundColor: eventColors[e.type] || "#CBD5E1" },
                ]}
              >
                <Text style={styles.eventTitle}>{e.title}</Text>
                <Text style={styles.eventDate}>{e.date}</Text>
                {e.description ? (
                  <Text style={styles.eventDesc}>{e.description}</Text>
                ) : null}
              </View>
            ))
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 12 },
  placeholder: { fontSize: 14, color: "gray" },
  eventCard: { borderRadius: 8, padding: 12, marginBottom: 8 },
  eventTitle: { fontWeight: "700", color: "#fff" },
  eventDate: { fontSize: 12, color: "#f0f0f0" },
  eventDesc: { fontSize: 13, color: "#f8f8f8", marginTop: 4 },
});
