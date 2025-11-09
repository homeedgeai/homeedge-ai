import React, { useEffect } from "react";
import { View, Image, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

export default function SplashScreen() {
  const router = useRouter();
  const shift = useSharedValue(0);

  useEffect(() => {
    shift.value = withRepeat(withTiming(1, { duration: 8000 }), -1, true);
    const timer = setTimeout(async () => {
      const user = await AsyncStorage.getItem("ohai:user");
      if (user) router.replace("/");
      else router.replace("/login");
    }, 3000); // 3-second splash
    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: Math.sin(Date.now() / 2500) * 20 }],
  }));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#000000", "#1b1a12", "#d4af37"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View style={[styles.overlay, animatedStyle]}>
        <LinearGradient
          colors={["rgba(255,215,0,0.2)", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.swoosh}
        />
      </Animated.View>
      <Image
        source={require("../assets/images/homeedge-logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  overlay: { ...StyleSheet.absoluteFillObject },
  swoosh: {
    width: width * 1.5,
    height: height,
    opacity: 0.5,
    transform: [{ rotate: "15deg" }],
  },
  logo: {
    width: 220,
    height: 220,
  },
});
