// components/EventsCalendar.tsx
import React, { useState, useMemo } from "react";
import { Calendar } from "react-native-calendars";
import { useAppContext } from "../context/AppContext";

interface Props {
  eventColors: Record<string, string>;
  onDateSelect?: (date: string) => void;
}

export default function EventsCalendar({ eventColors, onDateSelect }: Props) {
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

    if (selectedDate && !marked[selectedDate]) {
      marked[selectedDate] = {
        selected: true,
        selectedColor: "#CCE5FF",
      };
    }

    return marked;
  }, [events, selectedDate]);

  return (
    <Calendar
      markedDates={markedDates}
      onDayPress={(day) => {
        setSelectedDate(day.dateString);
        onDateSelect?.(day.dateString);
      }}
      theme={{
        selectedDayBackgroundColor: "#007AFF",
        selectedDayTextColor: "#fff",
        todayTextColor: "#FF3B30",
        dotColor: "#007AFF",
        arrowColor: "#007AFF",
      }}
    />
  );
}
