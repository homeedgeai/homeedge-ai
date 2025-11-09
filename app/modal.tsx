import { Link } from "expo-router";
import { StyleSheet } from "react-native";
import { ThemedText } from "../components/themed-text";
import { ThemedView } from "../components/themed-view";

export default function ModalScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>📄 Floor Plan Viewer</ThemedText>
      <ThemedText style={styles.subtitle}>
        This is a modal — you can show floorplan previews, status updates, or
        scanning info here.
      </ThemedText>

      <Link href="/" dismissTo style={styles.link}>
        <ThemedText style={styles.linkText}>🏠 Back to Dashboard</ThemedText>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9FAFB",
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
    color: "#111",
  },
  subtitle: {
    fontSize: 15,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
  link: {
    backgroundColor: "#2563EB",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  linkText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
