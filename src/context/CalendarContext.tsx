import React, { createContext, useContext, useState, ReactNode } from "react";

type CalendarEvent = {
  id: string;
  title: string;
  date: string; // ISO string
};

type CalendarContextType = {
  events: CalendarEvent[];
  addEvent: (event: Omit<CalendarEvent, "id">) => void;
  removeEvent: (id: string) => void;
};

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export const CalendarProvider = ({ children }: { children: ReactNode }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const addEvent = (event: Omit<CalendarEvent, "id">) => {
    const newEvent: CalendarEvent = { ...event, id: Date.now().toString() };
    setEvents((prev) => [newEvent, ...prev]);
  };

  const removeEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <CalendarContext.Provider value={{ events, addEvent, removeEvent }}>
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendarContext = () => {
  const context = useContext(CalendarContext);
  if (!context) throw new Error("useCalendarContext must be used inside a CalendarProvider");
  return context;
};
