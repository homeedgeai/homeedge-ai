import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { colors, spacing, fonts } from "@src/theme";

const sampleNotifications = [
  { id: "1", message: "New lead added to your dashboard 🚀", time: "2h ago" },
  { id: "2", message: "Property 123 Maple St was sold 🎉", time: "4h ago" },
  { id: "3", message: "Your weekly report is ready 📊", time: "1d ago" },
];

export default function NotificationsScreen() {
  const router = useRouter();

  const renderItem = ({ item }: { item: (typeof sampleNotifications)[0] }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => router.push("/listings")}
    >
      <Image
        source={require("@assets/images/profile.png")}
        style={styles.avatar}
      />
      <View style={styles.textContainer}>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      <FlatList
        data={sampleNotifications}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.m,
  },
  title: {
    fontSize: fonts.lg,
    fontWeight: "700",
    marginBottom: spacing.m,
    color: colors.text,
  },
  list: { paddingBottom: 100 },
  item: { flexDirection: "row", alignItems: "center", marginBottom: spacing.m },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: spacing.s },
  textContainer: { flex: 1 },
  message: { fontSize: fonts.md, color: colors.text },
  time: { fontSize: 12, color: colors.textSecondary },
});
