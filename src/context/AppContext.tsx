import React, { createContext, useContext, useState } from "react";

type EventType = "sold" | "dropped" | "meeting" | "reminder" | "custom";

type AppContextType = {
  events: Record<string, EventType[]>;
  addEvent: (date: string, type: EventType) => void;
  removeEvent: (date: string, idx: number) => void;
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<Record<string, EventType[]>>({}); // ✅ default empty object

  const addEvent = (date: string, type: EventType) => {
    setEvents((prev) => ({
      ...prev,
      [date]: [...(prev[date] || []), type],
    }));
  };

  const removeEvent = (date: string, idx: number) => {
    setEvents((prev) => {
      const updated = [...(prev[date] || [])];
      updated.splice(idx, 1);
      return { ...prev, [date]: updated };
    });
  };

  return (
    <AppContext.Provider value={{ events, addEvent, removeEvent }}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used inside AppProvider");
  return ctx;
};
