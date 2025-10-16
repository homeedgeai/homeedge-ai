import AsyncStorage from "@react-native-async-storage/async-storage";

const PERFORMANCE_KEY = "ohai:performance";

export type Performance = {
  totalViews: number;
  totalClicks: number;
  conversionRate: number;
};

export async function getPerformance(): Promise<Performance> {
  try {
    const raw = await AsyncStorage.getItem(PERFORMANCE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("❌ Failed to load performance", e);
  }
  return { totalViews: 0, totalClicks: 0, conversionRate: 0 };
}

export async function incrementMetric(metric: "views" | "clicks") {
  const perf = await getPerformance();
  if (metric === "views") perf.totalViews += 1;
  if (metric === "clicks") perf.totalClicks += 1;

  // Conversion = clicks / views (if views > 0)
  perf.conversionRate =
    perf.totalViews > 0 ? (perf.totalClicks / perf.totalViews) * 100 : 0;

  await AsyncStorage.setItem(PERFORMANCE_KEY, JSON.stringify(perf));
}
