import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE = process.env.EXPO_PUBLIC_API_BASE || "http://192.168.1.178:8000";

export function useSubscription() {
  const [plan, setPlan] = useState<"basic" | "pro" | "enterprise" | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const userData = await AsyncStorage.getItem("ohai:user");
        if (!userData) return;
        const { email } = JSON.parse(userData);
        const res = await fetch(`${API_BASE}/user/plan?email=${email}`);
        const data = await res.json();
        setPlan(data.plan || "basic");
      } catch (err) {
        console.error("Error fetching plan:", err);
        setPlan("basic");
      }
    })();
  }, []);

  return { plan, isPro: plan === "pro" || plan === "enterprise" };
}
