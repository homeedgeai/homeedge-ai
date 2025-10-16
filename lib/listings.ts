// lib/listings.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

const LISTINGS_KEY = "ohai:listings";

export type ListingData = {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  beds?: string;
  baths?: string;
  sqft?: string;
  price?: string;
  hoa?: string;
  taxes?: string;
  highlights?: string;
  notes?: string;
  photos: string[]; // URLs for now
  wantProDescription: boolean;
  wantSocialCaptions: boolean;
  wantPhotoEnhance: boolean;
};

export type ListingRecord = {
  id: string;
  createdAt: number;
  data: ListingData;
  description?: string;     // AI description (optional)
  captions?: string[];      // AI captions (optional)
};

export async function getListings(): Promise<ListingRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(LISTINGS_KEY);
    if (!raw) return [];
    // newest first
    return (JSON.parse(raw) as ListingRecord[]).sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return [];
  }
}

export async function getListingById(id: string): Promise<ListingRecord | undefined> {
  const all = await getListings();
  return all.find((l) => l.id === id);
}

export async function saveListings(all: ListingRecord[]) {
  await AsyncStorage.setItem(LISTINGS_KEY, JSON.stringify(all));
}

export async function saveListing(rec: ListingRecord) {
  const all = await getListings();
  const exists = all.some((l) => l.id === rec.id);
  const next = exists ? all.map((l) => (l.id === rec.id ? rec : l)) : [rec, ...all];
  await saveListings(next);
}

export async function deleteListing(id: string) {
  const all = await getListings();
  const next = all.filter((l) => l.id !== id);
  await saveListings(next);
}
