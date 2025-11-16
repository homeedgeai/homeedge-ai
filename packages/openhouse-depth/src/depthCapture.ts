import { requireNativeModule } from "expo-modules-core";

export type DepthCaptureStatus =
  | "idle"
  | "starting"
  | "running"
  | "uploading"
  | "finished"
  | "unsupported";

export type DepthCaptureModuleType = {
  start: (jobId: string, backendUrl: string) => Promise<DepthCaptureStatus>;
  stop: () => Promise<void>;
};

let nativeModule: DepthCaptureModuleType | null = null;

try {
  nativeModule = requireNativeModule<DepthCaptureModuleType>(
    "DepthCaptureModule"
  );
} catch (e) {
  console.warn("[DepthCapture] Native module not found, using JS stub.", e);
}

const DepthCapture: DepthCaptureModuleType =
  nativeModule ?? {
    async start(jobId, backendUrl) {
      console.log("[DepthCapture] stub start", { jobId, backendUrl });
      return "unsupported";
    },
    async stop() {
      console.log("[DepthCapture] stub stop");
    },
  };

export default DepthCapture;
