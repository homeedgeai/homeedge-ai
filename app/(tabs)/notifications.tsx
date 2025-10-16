import React from "react";
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { colors, spacing, fonts } from "../../src/theme";

const sampleNotifications = [
  { id: "1", message: "New lead added to your dashboard 🚀", time: "2h ago" },
  { id: "2", message: "Your listing at 123 Maple St got 5 new views", time: "5h ago" },
  { id: "3", message: "Upcoming showing scheduled for tomorrow", time: "1d ago" },
];

export default function NotificationsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerBar}>
        <Text style={styles.header}>Notifications</Text>
        <TouchableOpacity onPress={() => router.push("/(tabs)/settings")}>
          <Image
            source={require("../../assets/images/profile.png")}
            style={styles.avatar}
          />
        </TouchableOpacity>
      </View>

      {/* Notification List */}
      <FlatList
        data={sampleNotifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.message}>{item.message}</Text>
            <Text style={styles.time}>{item.time}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No notifications yet 📭</Text>
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.m },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.l,
  },
  header: { ...fonts.h1 },
  avatar: { width: 36, height: 36, borderRadius: 18 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: spacing.m,
    marginBottom: spacing.m,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  message: { ...fonts.body, color: colors.text },
  time: { ...fonts.small, color: colors.subtext, marginTop: 4 },
  empty: {
    textAlign: "center",
    marginTop: 40,
    color: colors.subtext,
    ...fonts.body,
  },
});
