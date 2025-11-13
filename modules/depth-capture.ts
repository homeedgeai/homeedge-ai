import { requireNativeModule } from "expo-modules-core";
import { Platform } from "react-native";

export interface DepthCaptureModuleType {
  start: (jobId: string, backendURL: string) => Promise<string | void>;
  stop: () => Promise<string | void>;
}

let NativeModule: DepthCaptureModuleType | null = null;

try {
  // Must match the Swift module name EXACTLY
  NativeModule = requireNativeModule<DepthCaptureModuleType>("DepthCaptureModule");
} catch (e) {
  console.warn("[DepthCapture] Native module not found yet. Using fallback.", e);
  NativeModule = null;
}

const DepthCapture: DepthCaptureModuleType = {
  async start(jobId: string, backendURL: string) {
    if (Platform.OS !== "ios") {
      console.warn("DepthCapture.start() is only available on iOS LiDAR devices.");
      return;
    }
    if (!NativeModule) {
      console.warn("[DepthCapture] Native module missing. Did you run an EAS build?");
      throw new Error("DepthCapture native module not linked yet.");
    }
    return NativeModule.start(jobId, backendURL);
  },

  async stop() {
    if (Platform.OS !== "ios") return;
    if (!NativeModule) {
      console.warn("[DepthCapture] Native module missing. Cannot stop session.");
      return;
    }
    return NativeModule.stop();
  },
};

export default DepthCapture;
