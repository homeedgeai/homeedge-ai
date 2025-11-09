// utils/storage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "ohai:listings";

export type Listing = {
  id: string;
  title?: string;
  address?: string;
  price?: string | number;
  description?: string;
  image?: string;
  coords?: { latitude: number; longitude: number };
  createdAt?: string;
};

/** Return all listings (newest first) */
export const getListings = async (): Promise<Listing[]> => {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const parsed: Listing[] = raw ? JSON.parse(raw) : [];
    // newest first
    return parsed.sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  } catch (e) {
    console.log("getListings error:", e);
    return [];
  }
};

/** Save a new listing (without coords by default) */
export const saveListing = async (listing: Listing): Promise<Listing[]> => {
  try {
    const all = await getListings();
    const newItem = { ...listing, createdAt: new Date().toISOString() };
    const updated = [newItem, ...all];
    await AsyncStorage.setItem(KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.log("saveListing error:", e);
    return [];
  }
};

/** Update a listing by id (e.g., to add coords when user taps Tag to Map) */
export const updateListingById = async (
  id: string,
  patch: Partial<Listing>
): Promise<Listing[]> => {
  try {
    const all = await getListings();
    const updated = all.map((l) => (l.id === id ? { ...l, ...patch } : l));
    await AsyncStorage.setItem(KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.log("updateListingById error:", e);
    return [];
  }
};

export const deleteListingById = async (id: string): Promise<Listing[]> => {
  try {
    const all = await getListings();
    const updated = all.filter((l) => l.id !== id);
    await AsyncStorage.setItem(KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.log("deleteListingById error:", e);
    return [];
  }
};

export const clearListings = async () => {
  await AsyncStorage.removeItem(KEY);
};
