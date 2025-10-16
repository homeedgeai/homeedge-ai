import React, { createContext, useContext, useState, ReactNode } from "react";

type PerformanceData = {
  totalViews: number;
  totalClicks: number;
  conversionRate: number;
  listingsCreated: number;
  leadsGenerated: number;
};

type PerformanceContextType = {
  performance: PerformanceData;
  updatePerformance: (updates: Partial<PerformanceData>) => void;
  resetPerformance: () => void;
};

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

export function PerformanceProvider({ children }: { children: ReactNode }) {
  const [performance, setPerformance] = useState<PerformanceData>({
    totalViews: 0,
    totalClicks: 0,
    conversionRate: 0,
    listingsCreated: 0,
    leadsGenerated: 0,
  });

  const updatePerformance = (updates: Partial<PerformanceData>) => {
    setPerformance((prev) => {
      const merged = { ...prev, ...updates };
      if (merged.totalViews > 0) {
        merged.conversionRate = (merged.totalClicks / merged.totalViews) * 100;
      }
      return merged;
    });
  };

  const resetPerformance = () => {
    setPerformance({
      totalViews: 0,
      totalClicks: 0,
      conversionRate: 0,
      listingsCreated: 0,
      leadsGenerated: 0,
    });
  };

  return (
    <PerformanceContext.Provider value={{ performance, updatePerformance, resetPerformance }}>
      {children}
    </PerformanceContext.Provider>
  );
}

export function usePerformanceContext() {
  const ctx = useContext(PerformanceContext);
  if (!ctx) throw new Error("usePerformanceContext must be used inside PerformanceProvider");
  return ctx;
}
