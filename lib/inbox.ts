import AsyncStorage from "@react-native-async-storage/async-storage";

export type Message = {
  id: string;
  from: "lead" | "agent";
  text: string;
  ts: number;
};

export type Thread = {
  id: string;
  name: string;
  email: string;
  messages: Message[];
  unread: boolean;
  status?: "open" | "closed" | "dropped";
};

const STORAGE_KEY = "ohai:threads";

// --- Get all threads ---
export async function getThreads(): Promise<Thread[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Thread[]) : [];
  } catch (e) {
    console.error("❌ Failed to load threads", e);
    return [];
  }
}

// --- Save threads ---
export async function saveThreads(threads: Thread[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
  } catch (e) {
    console.error("❌ Failed to save threads", e);
  }
}

// --- Simulate new lead (demo only) ---
export async function simulateLead(): Promise<Thread> {
  const id = Date.now().toString();
  const newThread: Thread = {
    id,
    name: `Lead ${id.slice(-4)}`,
    email: `lead${id.slice(-4)}@example.com`,
    unread: true,
    status: "open",
    messages: [
      {
        id: id + "-m1",
        from: "lead",
        text: "Hi! I'm interested in 123 Maple St. Is it still available?",
        ts: Date.now(),
      },
    ],
  };

  const threads = await getThreads();
  const updated = [newThread, ...threads];
  await saveThreads(updated);

  return newThread;
}
