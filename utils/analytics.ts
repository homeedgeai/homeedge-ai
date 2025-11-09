// utils/analytics.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Example analytics fetcher for your Performance screen.
 * Pulls simple view, lead, and listing metrics.
 * Replace or expand this later with real API data or Firebase stats.
 */
export const getAnalytics = async () => {
  try {
    const views = await AsyncStorage.getItem("ohai:views");
    const leads = await AsyncStorage.getItem("ohai:leads");
    const listings = await AsyncStorage.getItem("ohai:listings");

    return {
      views: views ? Number(views) : 2340, // fallback sample data
      leads: leads ? Number(leads) : 185,
      listings: listings ? JSON.parse(listings).length : 25,
      updatedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.log("Analytics error:", err);
    return { views: 0, leads: 0, listings: 0 };
  }
};
