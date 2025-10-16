import React, { useState, useEffect } from "react";
import {
  View,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from "react-native";
import { SvgXml } from "react-native-svg";
import { Image } from "expo-image";
import {
  GestureHandlerRootView,
  PinchGestureHandler,
  PanGestureHandler,
} from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

const SERVER_URL = "http://192.168.1.178:8000"; // ⚡ your LAN backend

export default function FloorplanViewer() {
  const [pngUri, setPngUri] = useState("");
  const [svgXml, setSvgXml] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const loadAssets = async () => {
    try {
      const ts = Date.now();

      // Use final structured or styled files
      setPngUri(`${SERVER_URL}/viewer/floorplan_structured.png?t=${ts}`);

      const svgRes = await fetch(`${SERVER_URL}/viewer/floorplan_styled.svg?t=${ts}`);
      const svgText = await svgRes.text();
      setSvgXml(svgText);
    } catch (e: any) {
      console.error("Failed to load viewer assets:", e.message);
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAssets();
    setTimeout(() => setRefreshing(false), 800);
  };

  const onPinchEvent = (event: any) => {
    scale.value = withTiming(event.nativeEvent.scale, { duration: 60 });
  };

  const onPanEvent = (event: any) => {
    translateX.value = withTiming(event.nativeEvent.translationX / 2, { duration: 60 });
    translateY.value = withTiming(event.nativeEvent.translationY / 2, { duration: 60 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <GestureHandlerRootView style={styles.root}>
      <ScrollView
        style={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>🏗️ HomeEdge Floor Plan</Text>

        {svgXml ? (
          <PanGestureHandler onGestureEvent={onPanEvent}>
            <PinchGestureHandler onGestureEvent={onPinchEvent}>
              <Animated.View style={[animatedStyle, styles.floorplanContainer]}>
                <View style={{ position: "relative" }}>
                  {/* Optional background image */}
                  <Image
                    source={{ uri: pngUri }}
                    style={styles.image}
                    contentFit="contain"
                  />

                  {/* SVG overlay */}
                  <View style={styles.svgContainer}>
                    <SvgXml xml={svgXml} width="100%" height="100%" />
                  </View>
                </View>
              </Animated.View>
            </PinchGestureHandler>
          </PanGestureHandler>
        ) : (
          <ActivityIndicator size="large" color="#007AFF" />
        )}

        {/* Zoom Controls */}
        <View style={styles.zoomControls}>
          <TouchableOpacity
            onPress={() => (scale.value = withTiming(scale.value + 0.1))}
            style={styles.zoomButton}
          >
            <Text style={styles.zoomText}>＋</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => (scale.value = withTiming(scale.value - 0.1))}
            style={styles.zoomButton}
          >
            <Text style={styles.zoomText}>－</Text>
          </TouchableOpacity>
        </View>

        {/* Property Info */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>Total Size: ~1648 sqft</Text>
          <Text style={styles.infoText}>2 Bedrooms · 2 Bathrooms</Text>
          <Text style={[styles.infoText, { color: "#007AFF", marginTop: 5 }]}>
            homeedge.org
          </Text>
        </View>

        {/* Refresh Button */}
        <TouchableOpacity onPress={loadAssets} style={styles.refreshButton}>
          <Text style={styles.refreshText}>🔄 Refresh Floorplan</Text>
        </TouchableOpacity>
      </ScrollView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  scroll: { flex: 1 },
  scrollContent: { alignItems: "center", paddingBottom: 100 },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#007AFF",
    marginVertical: 15,
  },
  floorplanContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: Dimensions.get("window").width * 0.9,
    height: 500,
    borderRadius: 12,
    backgroundColor: "#f7f7f7",
  },
  svgContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  zoomControls: {
    flexDirection: "row",
    marginTop: 15,
  },
  zoomButton: {
    backgroundColor: "#007AFF",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 8,
  },
  zoomText: { color: "#fff", fontSize: 24, fontWeight: "600" },
  infoBox: {
    marginTop: 25,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#f0f4ff",
    alignItems: "center",
  },
  infoText: { color: "#333", fontSize: 15, fontWeight: "500" },
  refreshButton: {
    marginTop: 25,
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  refreshText: { color: "white", fontWeight: "600" },
});
