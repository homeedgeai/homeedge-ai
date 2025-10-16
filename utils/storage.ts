// utils/storage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Listing = {
  id: string;
  createdAt: number;
  address: string;
  price: string;
  bedrooms: string;
  bathrooms: string;
  sqft: string;
  description: string;
  photoUri?: string | null;
};

const LISTINGS_KEY = "oh:listings";

export async function getListings(): Promise<Listing[]> {
  const raw = await AsyncStorage.getItem(LISTINGS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Listing[];
  } catch {
    return [];
  }
}

export async function addListing(newListing: Listing) {
  const all = await getListings();
  const next = [newListing, ...all];
  await AsyncStorage.setItem(LISTINGS_KEY, JSON.stringify(next));
}
