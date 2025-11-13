import { requireNativeModule } from "expo-modules-core";

type DepthModuleType = {
  start(jobId: string, backendURL: string): Promise<string>;
  stop(): Promise<string>;
};

const DepthCapture: DepthModuleType = requireNativeModule("DepthCaptureModule");
export default DepthCapture;
