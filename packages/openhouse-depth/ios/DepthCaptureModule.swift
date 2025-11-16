// packages/openhouse-depth/ios/DepthCaptureModule.swift

import ExpoModulesCore

public class DepthCaptureModule: Module {
  public func definition() -> ModuleDefinition {
    Name("DepthCaptureModule")

    // start(jobId, backendUrl) -> "unsupported"
    AsyncFunction("start") { (jobId: String, backendUrl: String) -> String in
      NSLog("[DepthCaptureModule] start called jobId=\(jobId), backendUrl=\(backendUrl)")
      // For now we just report "unsupported" so JS knows
      // there's a native module, but no real implementation yet.
      return "unsupported"
    }

    // stop() -> void
    AsyncFunction("stop") {
      NSLog("[DepthCaptureModule] stop called")
      // no-op for now
    }
  }
}
