import AsyncStorage from "@react-native-async-storage/async-storage";

export type Profile = {
  name: string;
  photo: string; // URL or base64 string
};

const PROFILE_KEY = "ohai:profile";
export const PROFILE_CHANGED = "profile_changed";

// --- Simple emitter implementation ---
type Listener = (p: Profile) => void;
const listeners = new Set<Listener>();

export async function getProfile(): Promise<Profile> {
  try {
    const raw = await AsyncStorage.getItem(PROFILE_KEY);
    if (raw) return JSON.parse(raw) as Profile;
  } catch {}
  return { name: "Agent", photo: "" };
}

export async function saveProfile(p: Profile) {
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(p));
  listeners.forEach((cb) => cb(p)); // notify all listeners
}

export function subscribeProfileChange(cb: Listener) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
