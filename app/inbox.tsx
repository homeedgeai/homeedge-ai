import React, { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type Msg = { id: string; from: string; subject: string; body: string; time: string };

const initial: Msg[] = [
  { id: "1", from: "Buyer • John", subject: "Schedule a tour?", body: "Hi! Can we tour 123 Main St this week?", time: "10:04 AM" },
  { id: "2", from: "Seller • Emily", subject: "Offer received", body: "We received an offer—call when free.", time: "Yesterday" },
];

export default function InboxScreen() {
  const [messages, setMessages] = useState(initial);
  const [selected, setSelected] = useState<Msg | null>(null);
  const [reply, setReply] = useState("");

  const send = () => {
    if (!selected || !reply.trim()) return;
    // fake reply append
    setMessages((prev) => [
      { id: String(Date.now()), from: "You", subject: `Re: ${selected.subject}`, body: reply.trim(), time: "Now" },
      ...prev,
    ]);
    setReply("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Inbox</Text>

      {selected ? (
        <View style={styles.thread}>
          <Text style={styles.threadFrom}>{selected.from}</Text>
          <Text style={styles.threadSubject}>{selected.subject}</Text>
          <Text style={styles.threadBody}>{selected.body}</Text>

          <TextInput
            style={styles.input}
            placeholder="Type a quick reply…"
            value={reply}
            onChangeText={setReply}
          />
          <Pressable style={styles.btn} onPress={send}>
            <Text style={styles.btnText}>Send</Text>
          </Pressable>

          <Pressable onPress={() => setSelected(null)} style={{ marginTop: 10 }}>
            <Text style={{ color: "#2563eb", fontWeight: "600" }}>← Back to inbox</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          renderItem={({ item }) => (
            <Pressable style={styles.item} onPress={() => setSelected(item)}>
              <Text style={styles.itemFrom}>{item.from} · <Text style={styles.itemTime}>{item.time}</Text></Text>
              <Text style={styles.itemSubject}>{item.subject}</Text>
              <Text numberOfLines={1} style={styles.itemBody}>{item.body}</Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  h1: { fontSize: 28, fontWeight: "700", padding: 16 },
  item: { backgroundColor: "#f3f4f6", borderRadius: 12, padding: 12 },
  itemFrom: { fontWeight: "600" },
  itemTime: { color: "#6b7280", fontWeight: "400" },
  itemSubject: { marginTop: 2 },
  itemBody: { color: "#4b5563" },
  thread: { padding: 16, gap: 8 },
  threadFrom: { fontWeight: "700", fontSize: 16 },
  threadSubject: { fontWeight: "600" },
  threadBody: { color: "#374151", marginVertical: 8 },
  input: { backgroundColor: "#f3f4f6", borderRadius: 10, padding: 12, marginTop: 8 },
  btn: { backgroundColor: "#2563eb", borderRadius: 10, paddingVertical: 12, alignItems: "center", marginTop: 8 },
  btnText: { color: "#fff", fontWeight: "700" },
});
