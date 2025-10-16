// app/listings/floorplan.tsx
import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from "react-native";
import * as FileSystem from "expo-file-system";

const BACKEND = "http://armonmoore.local:8000"; // your local mDNS host

export default function Floorplan() {
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"edges"|"ai">("ai");
  const [pngUrl, setPngUrl] = useState<string | null>(null);

  const fetchLatest = async () => {
    setPngUrl(null);
    try {
      if (mode === "ai") {
        setPngUrl(`${BACKEND}/viewer/floorplan_labeled.png?ts=${Date.now()}`);
      } else {
        setPngUrl(`${BACKEND}/viewer/floorplan.png?ts=${Date.now()}`);
      }
    } catch (e:any) {
      console.warn(e);
    }
  };

  useEffect(() => { fetchLatest(); }, [mode]);

  const runSegment = async () => {
    // naive: segment the most recent uploaded image (you can pass a chosen filename)
    // Replace with your own filename picker if needed
    try {
      setBusy(true);
      // simple: list uploads and pick the last jpg/png
      const res = await fetch(`${BACKEND}/uploads`); // optional if you expose listing
      // If you don't expose a listing route, just hard-code the filename you want to test.
      // Here we assume you’ll supply a filename manually:
      const filename = "frame_00200.jpg"; // TODO: swap for a real uploaded frame name
      const fd = new FormData();
      fd.append("filename", filename);
      const r = await fetch(`${BACKEND}/segment`, { method: "POST", body: fd });
      if (!r.ok) {
        const j = await r.json().catch(()=>({}));
        throw new Error(j?.detail || `HTTP ${r.status}`);
      }
      await fetchLatest();
      Alert.alert("Segmented", "AI blueprint updated.");
    } catch (e:any) {
      Alert.alert("Segment error", String(e.message || e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: "600", marginBottom: 12 }}>🧭 Floorplan Preview</Text>

      <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
        <TouchableOpacity onPress={() => setMode("ai")} style={{ paddingVertical: 8, paddingHorizontal: 12, backgroundColor: mode==="ai"?"#007bff":"#eee", borderRadius: 8 }}>
          <Text style={{ color: mode==="ai"?"#fff":"#333" }}>AI Blueprint</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setMode("edges")} style={{ paddingVertical: 8, paddingHorizontal: 12, backgroundColor: mode==="edges"?"#007bff":"#eee", borderRadius: 8 }}>
          <Text style={{ color: mode==="edges"?"#fff":"#333" }}>Raw Edges</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={runSegment} disabled={busy} style={{ paddingVertical: 8, paddingHorizontal: 12, backgroundColor: "#28a745", borderRadius: 8 }}>
          <Text style={{ color: "#fff" }}>{busy?"Segmenting…":"Segment latest"}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={fetchLatest} style={{ paddingVertical: 8, paddingHorizontal: 12, backgroundColor: "#6c757d", borderRadius: 8 }}>
          <Text style={{ color: "#fff" }}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {pngUrl ? (
        <Image
          source={{ uri: pngUrl }}
          style={{ width: "100%", height: 480, resizeMode: "contain", backgroundColor: "#f6f1eb", borderRadius: 12 }}
        />
      ) : (
        <View style={{ height: 120, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator />
          <Text style={{ marginTop: 8 }}>Waiting for floorplan…</Text>
        </View>
      )}
    </ScrollView>
  );
}
