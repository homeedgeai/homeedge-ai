import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { getThreads, Thread } from "../../lib/inbox";

export default function PerformanceScreen() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [sold, setSold] = useState(0);
  const [dropped, setDropped] = useState(0);
  const [goal, setGoal] = useState(5); // default monthly goal
  const [inputGoal, setInputGoal] = useState("");

  useEffect(() => {
    (async () => {
      const leads = await getThreads();
      setThreads(leads);

      // Count sold vs dropped
      const soldCount = leads.filter((t) => t.status === "closed").length;
      const droppedCount = leads.filter((t) => t.status === "dropped").length;

      setSold(soldCount);
      setDropped(droppedCount);
    })();
  }, []);

  const progress = goal > 0 ? Math.min(100, Math.round((sold / goal) * 100)) : 0;

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>📊 Performance</Text>

        {/* Goals Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🎯 Monthly Goal</Text>
          <Text style={styles.progressText}>
            {sold} of {goal} closed deals ({progress}%)
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>

          {/* Change goal */}
          <View style={styles.goalRow}>
            <TextInput
              style={styles.input}
              placeholder="Set new goal (e.g. 10)"
              value={inputGoal}
              onChangeText={setInputGoal}
              keyboardType="number-pad"
            />
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={() => {
                if (!inputGoal) return;
                setGoal(Number(inputGoal));
                setInputGoal("");
              }}
            >
              <Text style={styles.saveBtnTxt}>Update</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sold vs Dropped */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📈 Leads Summary</Text>
          <Text style={styles.stat}>✅ Sold: {sold}</Text>
          <Text style={styles.stat}>❌ Dropped: {dropped}</Text>
        </View>

        {/* Monthly Breakdown */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📅 Monthly Breakdown</Text>
          {threads.length === 0 ? (
            <Text style={styles.empty}>No leads yet.</Text>
          ) : (
            Object.entries(
              threads.reduce((acc, t) => {
                const month = new Date(
                  t.messages[0]?.ts || Date.now()
                ).toLocaleString("default", { month: "long", year: "numeric" });

                if (!acc[month]) acc[month] = { sold: 0, dropped: 0 };
                if (t.status === "closed") acc[month].sold += 1;
                if (t.status === "dropped") acc[month].dropped += 1;
                return acc;
              }, {} as Record<string, { sold: number; dropped: number }>)
            ).map(([month, stats]) => (
              <View key={month} style={styles.breakdownRow}>
                <Text style={styles.month}>{month}</Text>
                <Text style={styles.breakdownTxt}>
                  ✅ {stats.sold} | ❌ {stats.dropped}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  scroll: { padding: 16, paddingTop: 40 },
  title: { fontSize: 24, fontWeight: "800", marginBottom: 20 },

  card: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  stat: { fontSize: 16, marginBottom: 4, color: "#111" },

  empty: { color: "gray", fontSize: 14 },

  // Goal
  progressText: { fontSize: 16, marginBottom: 8 },
  progressBar: {
    height: 14,
    backgroundColor: "#e5e7eb",
    borderRadius: 8,
    marginBottom: 10,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#3b82f6",
    borderRadius: 8,
  },
  goalRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 8,
    backgroundColor: "#fff",
  },
  saveBtn: {
    backgroundColor: "#3b82f6",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  saveBtnTxt: { color: "#fff", fontWeight: "700" },

  // Breakdown
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
  },
  month: { fontWeight: "600", color: "#0f172a" },
  breakdownTxt: { color: "#111" },
});
