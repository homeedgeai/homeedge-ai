import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors, fonts, spacing } from "@src/theme";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const THREADS_KEY = "ohai:threads";

type Message = {
  id: string;
  from: "lead" | "agent";
  text: string;
  ts: number;
};

type Thread = {
  id: string;
  name: string;
  email: string;
  messages: Message[];
  unread: boolean;
  pinned?: boolean;
  typing?: boolean; // 👈 added for typing indicator
};

function formatTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function InboxScreen() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selected, setSelected] = useState<Thread | null>(null);
  const [compose, setCompose] = useState("");
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(THREADS_KEY);
      if (raw) setThreads(JSON.parse(raw));
    })();
  }, []);

  const saveThreads = async (list: Thread[]) => {
    setThreads(list);
    await AsyncStorage.setItem(THREADS_KEY, JSON.stringify(list));
  };

  const openThread = (t: Thread) => {
    setSelected({ ...t, unread: false });
    saveThreads(threads.map((p) => (p.id === t.id ? { ...p, unread: false } : p)));
    setTimeout(() => inputRef.current?.focus(), 250);
  };

  const send = (text?: string) => {
    const body = (text ?? compose).trim();
    if (!body || !selected) return;
    const msg: Message = {
      id: Date.now().toString(),
      from: "agent",
      text: body,
      ts: Date.now(),
    };
    const updatedThreads = threads.map((t) =>
      t.id === selected.id ? { ...t, messages: [...t.messages, msg] } : t
    );
    saveThreads(updatedThreads);
    setSelected((cur) =>
      cur ? { ...cur, messages: [...cur.messages, msg] } : cur
    );
    setCompose("");
  };

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Inbox · Leads</Text>
      </View>

      {/* Thread list */}
      {!selected ? (
        <FlatList
          data={[...threads.filter((t) => t.pinned), ...threads.filter((t) => !t.pinned)]}
          keyExtractor={(t) => t.id}
          ListEmptyComponent={<Text style={styles.empty}>No leads yet.</Text>}
          renderItem={({ item }) => {
            const last = item.messages[item.messages.length - 1];
            return (
              <TouchableOpacity
                style={styles.thread}
                onPress={() => openThread(item)}
              >
                <View style={styles.initialCircle}>
                  <Text style={styles.initialTxt}>{item.name[0] ?? "L"}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.threadTop}>
                    <Text style={styles.threadName}>{item.name}</Text>
                    {item.unread ? <View style={styles.unreadDot} /> : null}
                  </View>
                  <Text numberOfLines={1} style={styles.threadSnippet}>
                    {last?.from === "agent" ? "You: " : ""}
                    {last?.text}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      ) : (
        /* iMessage Style Thread */
        <Modal visible={!!selected} animationType="slide" onRequestClose={() => setSelected(null)}>
          <SafeAreaView style={styles.chatRoot}>
            {/* Chat Header */}
            <View style={styles.chatHeader}>
              <TouchableOpacity onPress={() => setSelected(null)}>
                <Text style={styles.back}>‹ Back</Text>
              </TouchableOpacity>
              <Text style={styles.chatName}>{selected?.name}</Text>
            </View>

            {/* Messages */}
            <FlatList
              data={selected?.messages ?? []}
              keyExtractor={(m) => m.id}
              contentContainerStyle={{ padding: spacing.m }}
              renderItem={({ item }) => (
                <View style={{ marginBottom: spacing.s }}>
                  <View
                    style={[
                      styles.bubble,
                      item.from === "agent" ? styles.agentBubble : styles.leadBubble,
                    ]}
                  >
                    <Text
                      style={[
                        styles.bubbleTxt,
                        { color: item.from === "agent" ? "#fff" : colors.text },
                      ]}
                    >
                      {item.text}
                    </Text>
                  </View>
                  <Text style={styles.timestamp}>{formatTime(item.ts)}</Text>
                </View>
              )}
              ListFooterComponent={
                <>
                  {/* Typing indicator */}
                  {selected?.typing && (
                    <View style={[styles.bubble, styles.leadBubble, { flexDirection: "row", gap: 3, paddingVertical: 6 }]}>
                      <View style={styles.dot} />
                      <View style={styles.dot} />
                      <View style={styles.dot} />
                    </View>
                  )}

                  {/* Read receipts */}
                  {selected?.messages?.length > 0 &&
                    selected.messages[selected.messages.length - 1].from === "agent" && (
                      <Text style={styles.readReceipt}>Read {formatTime(Date.now())}</Text>
                    )}
                </>
              }
            />

            {/* Composer */}
            <KeyboardAvoidingView
              behavior={Platform.select({ ios: "padding", android: undefined })}
              keyboardVerticalOffset={88}
            >
              <View style={styles.composer}>
                <TextInput
                  ref={inputRef}
                  style={styles.input}
                  value={compose}
                  onChangeText={setCompose}
                  placeholder="iMessage..."
                  placeholderTextColor={colors.subtext}
                  multiline
                />
                <TouchableOpacity style={styles.sendBtn} onPress={() => send()}>
                  <Text style={styles.sendTxt}>↑</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: spacing.m,
    paddingTop: spacing.s,
    paddingBottom: spacing.s,
  },
  title: { ...fonts.h1 },
  empty: { padding: spacing.m, color: colors.subtext },

  thread: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.m,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  initialCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E0E7FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.m,
  },
  initialTxt: { fontWeight: "700", color: "#3730A3" },
  threadTop: { flexDirection: "row", alignItems: "center" },
  threadName: { ...fonts.h2, marginRight: spacing.s },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  threadSnippet: { ...fonts.small },

  chatRoot: { flex: 1, backgroundColor: "#f2f2f7" },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.m,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  back: { fontSize: 17, color: colors.primary, marginRight: spacing.m },
  chatName: { ...fonts.h2, flex: 1, textAlign: "center" },

  bubble: {
    maxWidth: "75%",
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: 18,
  },
  agentBubble: {
    alignSelf: "flex-end",
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  leadBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#e5e5ea",
    borderBottomLeftRadius: 4,
  },
  bubbleTxt: { fontSize: 16 },
  timestamp: {
    fontSize: 12,
    color: colors.subtext,
    marginTop: 2,
    alignSelf: "center",
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.subtext,
    opacity: 0.7,
  },
  readReceipt: {
    fontSize: 12,
    color: colors.subtext,
    textAlign: "right",
    marginTop: 4,
    marginRight: spacing.m,
  },

  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.s,
    padding: spacing.s,
    margin: spacing.m,
    borderRadius: 25,
    backgroundColor: colors.bg,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    minHeight: 36,
    maxHeight: 120,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    fontSize: 16,
  },
  sendBtn: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  sendTxt: { color: "#fff", fontSize: 18, fontWeight: "700" },
});
