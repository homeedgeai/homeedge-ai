import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Image,
  Alert,
  Switch,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import Constants from "expo-constants";
import { useRouter } from "expo-router";

// Firebase
import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Utils
import { v4 as uuidv4 } from "uuid";

type FormState = {
  // Location
  address: string;
  city: string;
  state: string;
  zip: string;

  // Basic
  mlsId: string;
  price: string;
  bedrooms: string;
  bathrooms: string;
  squareFeet: string;
  lotSize: string; // acres

  // Property
  propertyType: string;
  yearBuilt: string;

  // Financial
  taxes: string;
  hoaFee: string; // per month
  mortgageEstimate: string;

  // Features
  garageSpaces: string;
  pool: boolean;
  description: string;

  // Agent
  agentName: string;
  agentPhone: string;
  brokerage: string;
};

export default function GenerateListingScreen() {
  const router = useRouter();
  const auth = getAuth();
  const db = getFirestore();
  const storage = getStorage();

  const [form, setForm] = useState<FormState>({
    address: "",
    city: "",
    state: "",
    zip: "",

    mlsId: "",
    price: "",
    bedrooms: "",
    bathrooms: "",
    squareFeet: "",
    lotSize: "",

    propertyType: "Single Family",
    yearBuilt: "",

    taxes: "",
    hoaFee: "",
    mortgageEstimate: "",

    garageSpaces: "",
    pool: false,
    description: "",

    agentName: "",
    agentPhone: "",
    brokerage: "",
  });

  const [images, setImages] = useState<string[]>([]);
  const [floorplan2D, setFloorplan2D] = useState<string | null>(null);
  const [tour3D, setTour3D] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fullAddress = useMemo(() => {
    const parts = [form.address, form.city, form.state, form.zip].filter(Boolean);
    return parts.join(", ");
  }, [form]);

  const pickImage = async (type: "image" | "2d" | "3d") => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.9,
    });
    if (res.canceled || !res.assets?.length) return;
    const uri = res.assets[0].uri;
    if (type === "image") setImages((prev) => [...prev, uri]);
    if (type === "2d") setFloorplan2D(uri);
    if (type === "3d") setTour3D(uri);
  };

  const uploadToStorage = async (uri: string, userId: string, folder = "listings") => {
    const resp = await fetch(uri);
    const blob = await resp.blob();
    const path = `users/${userId}/${folder}/${uuidv4()}`;
    const r = ref(storage, path);
    await uploadBytes(r, blob);
    return await getDownloadURL(r);
  };

  const geocodeAddress = async (addr: string) => {
    const apiKey =
      // Prefer app.json -> expo.extra.GOOGLE_MAPS_API_KEY, fallback to process.env
      (Constants.expoConfig?.extra as any)?.GOOGLE_MAPS_API_KEY ||
      (Constants.manifest?.extra as any)?.GOOGLE_MAPS_API_KEY ||
      (process.env as any)?.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      throw new Error("Missing GOOGLE_MAPS_API_KEY in app.json (expo.extra) or env.");
    }
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      addr
    )}&key=${apiKey}`;
    const res = await fetch(url);
    const json = await res.json();
    const best = json?.results?.[0];
    if (!best?.geometry?.location) {
      throw new Error("Could not geocode the provided address.");
    }
    const { lat, lng } = best.geometry.location;
    return { latitude: lat, longitude: lng, formatted: best.formatted_address };
  };

  const validate = () => {
    if (!form.address || !form.city || !form.state || !form.zip) {
      Alert.alert("Missing Address", "Please complete full property address.");
      return false;
    }
    if (!form.price) {
      Alert.alert("Missing Price", "Please enter the list price.");
      return false;
    }
    return true;
  };

  const saveListing = async () => {
    try {
      if (!validate()) return;
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Not Signed In", "Please sign in to add a listing.");
        return;
      }

      setSaving(true);

      // 1) Geocode
      const { latitude, longitude, formatted } = await geocodeAddress(fullAddress);

      // 2) Upload media
      const uploadedImages = await Promise.all(images.map((uri) => uploadToStorage(uri, user.uid, "listings")));
      const floorplanUrl = floorplan2D ? await uploadToStorage(floorplan2D, user.uid, "floorplans") : null;
      const tour3DUrl = tour3D ? await uploadToStorage(tour3D, user.uid, "tours") : null;

      // 3) Build Firestore doc (MLS-grade)
      const priceNum = parseCurrency(form.price);
      const taxesNum = parseCurrency(form.taxes);
      const hoaNum = parseCurrency(form.hoaFee);
      const mortgageNum = parseCurrency(form.mortgageEstimate);

      const bedroomsNum = form.bedrooms ? Number(form.bedrooms) : null;
      const bathroomsNum = form.bathrooms ? Number(form.bathrooms) : null;
      const sqftNum = form.squareFeet ? Number(form.squareFeet) : null;
      const lotSizeNum = form.lotSize ? Number(form.lotSize) : null;
      const garageNum = form.garageSpaces ? Number(form.garageSpaces) : null;
      const yearBuiltNum = form.yearBuilt ? Number(form.yearBuilt) : null;

      const listing = {
        // Map/Pin Essentials
        title: `${form.address}${form.city ? ", " + form.city : ""}`,
        address: form.address,
        city: form.city,
        state: form.state,
        zip: form.zip,
        formattedAddress: formatted,
        latitude,
        longitude,

        // Visuals
        photoUrl: uploadedImages?.[0] || null, // backwards compatible with your map.tsx
        coverImageUrl: uploadedImages?.[0] || null,
        images: uploadedImages,
        floorplanUrl,
        tour3DUrl,

        // MLS fields
        mlsId: form.mlsId || null,
        price: priceNum !== null ? priceNumToDisplay(priceNum) : null,
        priceNum, // keep numeric alongside formatted
        bedrooms: bedroomsNum,
        bathrooms: bathroomsNum,
        squareFeet: sqftNum,
        lotSize: lotSizeNum, // acres
        propertyType: form.propertyType,
        yearBuilt: yearBuiltNum,

        taxes: taxesNum,
        hoaFee: hoaNum,
        mortgageEstimate: mortgageNum,

        garageSpaces: garageNum,
        pool: !!form.pool,
        description: form.description || null,

        agentName: form.agentName || null,
        agentPhone: form.agentPhone || null,
        brokerage: form.brokerage || null,

        createdAt: serverTimestamp(),
      };

      // 4) Save to Firestore (private per user)
      await addDoc(collection(db, "users", user.uid, "listings"), listing);

      Alert.alert("Listing Uploaded ✅", "Your MLS listing is now on your map.");
      // Send them to map screen (adjust route path for your app)
      router.push("/map");
    } catch (e: any) {
      console.error(e);
      Alert.alert("Error", e?.message ?? "Could not save listing.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <LinearGradient
      colors={["#F9FAFB", "#E5E7EB"]}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Create MLS Listing</Text>
          <TouchableOpacity
            onPress={() => {
              if (router?.canGoBack?.()) router.back();
              else router?.push?.("/");
            }}
            style={styles.backBtn}
          >
            <Ionicons name="chevron-back" size={22} color="#007AFF" />
            <Text style={styles.backTxt}>Back</Text>
          </TouchableOpacity>
        </View>

        {/* Location */}
        <Card title="🏡 Property Information">
          <Input label="Address" placeholder="123 Main St" value={form.address}
                 onChangeText={(t) => setForm({ ...form, address: t })} />
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 6 }}>
              <Input label="City" placeholder="Austin"
                     value={form.city}
                     onChangeText={(t) => setForm({ ...form, city: t })} />
            </View>
            <View style={{ width: 90, marginRight: 6 }}>
              <Input label="State" placeholder="TX" autoCapitalize="characters" maxLength={2}
                     value={form.state}
                     onChangeText={(t) => setForm({ ...form, state: t.toUpperCase() })} />
            </View>
            <View style={{ width: 110 }}>
              <Input label="ZIP" placeholder="78704" keyboardType="number-pad"
                     value={form.zip}
                     onChangeText={(t) => setForm({ ...form, zip: t })} />
            </View>
          </View>
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 6 }}>
              <PickerField
                label="Property Type"
                value={form.propertyType}
                options={[
                  "Single Family",
                  "Condo",
                  "Townhouse",
                  "Multi-Family",
                  "Manufactured",
                  "Land",
                ]}
                onChange={(v) => setForm({ ...form, propertyType: v })}
              />
            </View>
            <View style={{ width: 120 }}>
              <Input label="Year Built" placeholder="2018" keyboardType="number-pad"
                     value={form.yearBuilt}
                     onChangeText={(t) => setForm({ ...form, yearBuilt: t })} />
            </View>
          </View>
        </Card>

        {/* Pricing */}
        <Card title="💰 Pricing & Financials">
          <Input label="Price" placeholder="$650,000" keyboardType="numeric"
                 value={form.price}
                 onChangeText={(t) => setForm({ ...form, price: t })} />
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 6 }}>
              <Input label="Taxes (annual)" placeholder="$7,200" keyboardType="numeric"
                     value={form.taxes}
                     onChangeText={(t) => setForm({ ...form, taxes: t })} />
            </View>
            <View style={{ flex: 1 }}>
              <Input label="HOA (monthly)" placeholder="$0" keyboardType="numeric"
                     value={form.hoaFee}
                     onChangeText={(t) => setForm({ ...form, hoaFee: t })} />
            </View>
          </View>
          <Input label="Mortgage Estimate (monthly)" placeholder="$3,400" keyboardType="numeric"
                 value={form.mortgageEstimate}
                 onChangeText={(t) => setForm({ ...form, mortgageEstimate: t })} />
        </Card>

        {/* Specs */}
        <Card title="🛏 Features & Specs">
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 6 }}>
              <Input label="Bedrooms" placeholder="3" keyboardType="number-pad"
                     value={form.bedrooms}
                     onChangeText={(t) => setForm({ ...form, bedrooms: t })} />
            </View>
            <View style={{ flex: 1 }}>
              <Input label="Bathrooms" placeholder="2.5" keyboardType="decimal-pad"
                     value={form.bathrooms}
                     onChangeText={(t) => setForm({ ...form, bathrooms: t })} />
            </View>
          </View>
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 6 }}>
              <Input label="Square Feet" placeholder="2100" keyboardType="number-pad"
                     value={form.squareFeet}
                     onChangeText={(t) => setForm({ ...form, squareFeet: t })} />
            </View>
            <View style={{ flex: 1 }}>
              <Input label="Lot Size (acres)" placeholder="0.25" keyboardType="decimal-pad"
                     value={form.lotSize}
                     onChangeText={(t) => setForm({ ...form, lotSize: t })} />
            </View>
          </View>
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 6 }}>
              <Input label="Garage Spaces" placeholder="2" keyboardType="number-pad"
                     value={form.garageSpaces}
                     onChangeText={(t) => setForm({ ...form, garageSpaces: t })} />
            </View>
            <View style={[styles.switchRow, { flex: 1 }]}>
              <Text style={styles.label}>Pool</Text>
              <Switch
                value={form.pool}
                onValueChange={(v) => setForm({ ...form, pool: v })}
                thumbColor={Platform.OS === "android" ? (form.pool ? "#fff" : "#fff") : undefined}
                trackColor={{ false: "rgba(156,163,175,0.4)", true: "#34C759" }}
              />
            </View>
          </View>
          <Input
            label="Description"
            placeholder="Beautiful modern home near parks and shops..."
            value={form.description}
            onChangeText={(t) => setForm({ ...form, description: t })}
            multiline
          />
        </Card>

        {/* Media */}
        <Card title="📸 Media Uploads">
          <UploadButton
            icon="images-outline"
            color="#007AFF"
            label="Add Property Photos"
            onPress={() => pickImage("image")}
          />
          <UploadButton
            icon="grid-outline"
            color="#FF9500"
            label="Add 2D Floorplan"
            onPress={() => pickImage("2d")}
          />
          <UploadButton
            icon="cube-outline"
            color="#AF52DE"
            label="Add 3D Tour (poster/image)"
            onPress={() => pickImage("3d")}
          />
          <View style={styles.previewWrap}>
            {images.map((img, i) => (
              <Image key={i} source={{ uri: img }} style={styles.thumb} resizeMode="cover" />
            ))}
            {floorplan2D && <Image source={{ uri: floorplan2D }} style={styles.thumb} />}
            {tour3D && <Image source={{ uri: tour3D }} style={styles.thumb} />}
          </View>
        </Card>

        {/* Agent */}
        <Card title="👤 Agent Info">
          <Input label="Agent Name" placeholder="Jane Agent"
                 value={form.agentName}
                 onChangeText={(t) => setForm({ ...form, agentName: t })} />
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 6 }}>
              <Input label="Phone" placeholder="555-123-4567" keyboardType="phone-pad"
                     value={form.agentPhone}
                     onChangeText={(t) => setForm({ ...form, agentPhone: t })} />
            </View>
            <View style={{ flex: 1 }}>
              <Input label="Brokerage" placeholder="Dream Realty"
                     value={form.brokerage}
                     onChangeText={(t) => setForm({ ...form, brokerage: t })} />
            </View>
          </View>
        </Card>

        <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={saveListing} disabled={saving}>
          {saving ? (
            <>
              <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
              <Text style={styles.saveTxt}>  Uploading...</Text>
            </>
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
              <Text style={styles.saveTxt}>  Save & Publish</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

/* ---------- UI Subcomponents ---------- */

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <BlurView intensity={Platform.OS === "ios" ? 25 : 70} tint="light" style={styles.formCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </BlurView>
  );
}

function Input({
  label,
  multiline,
  ...props
}: {
  label: string;
  multiline?: boolean;
  [key: string]: any;
}) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        style={[styles.input, multiline && { height: 90, textAlignVertical: "top" }]}
        placeholderTextColor="#9CA3AF"
        multiline={multiline}
      />
    </View>
  );
}

function PickerField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  // simple pill selector (no native picker to keep it pretty)
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.pillRow}>
        {options.map((opt) => {
          const active = opt === value;
          return (
            <TouchableOpacity
              key={opt}
              onPress={() => onChange(opt)}
              style={[styles.pill, active && styles.pillActive]}
            >
              <Text style={[styles.pillTxt, active && styles.pillTxtActive]}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function UploadButton({
  icon,
  color,
  label,
  onPress,
}: {
  icon: any;
  color: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={[styles.uploadBtn, { backgroundColor: color }]} onPress={onPress}>
      <Ionicons name={icon} size={18} color="#fff" />
      <Text style={styles.uploadTxt}>{label}</Text>
    </TouchableOpacity>
  );
}

/* ---------- Helpers ---------- */

function parseCurrency(v: string): number | null {
  if (!v) return null;
  const n = Number(String(v).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : null;
}
function priceNumToDisplay(n: number): string {
  try {
    return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  } catch {
    return `$${n}`;
  }
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    alignItems: "center",
  },
  title: { fontSize: 30, fontWeight: "700", color: "#111827" },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,122,255,0.08)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  backTxt: { color: "#007AFF", fontWeight: "600", marginLeft: 4 },

  formCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 16,
    marginTop: 20,
    backgroundColor: "rgba(255,255,255,0.75)",
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#111827", marginBottom: 12 },
  label: { color: "#111827", fontWeight: "500", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "rgba(156,163,175,0.35)",
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 12,
    padding: 12,
    color: "#111827",
    fontSize: 15,
  },
  row: { flexDirection: "row" },

  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  uploadTxt: { color: "#fff", fontWeight: "600", marginLeft: 8, fontSize: 15 },

  previewWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: "#D1D5DB",
  },

  saveBtn: {
    marginTop: 30,
    marginHorizontal: 20,
    backgroundColor: "#007AFF",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
    paddingVertical: 14,
  },
  saveTxt: { color: "#fff", fontWeight: "700", fontSize: 16 },

  // Pills
  pillRow: { flexDirection: "row", flexWrap: "wrap" },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.06)",
    marginRight: 6,
    marginBottom: 6,
  },
  pillActive: { backgroundColor: "rgba(0,122,255,0.15)" },
  pillTxt: { color: "#1F2937", fontWeight: "500" },
  pillTxtActive: { color: "#0A84FF", fontWeight: "700" },

  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(156,163,175,0.35)",
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
});
