import ExpoModulesCore
import ARKit
import AVFoundation

// MARK: - WebSocket wrapper
class WSClient: NSObject, URLSessionDelegate {
  private var task: URLSessionWebSocketTask?
  private var session: URLSession?

  func connect(_ url: URL) {
    let config = URLSessionConfiguration.default
    session = URLSession(configuration: config, delegate: self, delegateQueue: OperationQueue())
    task = session?.webSocketTask(with: url)
    task?.resume()
  }

  func send(text: String) {
    task?.send(.string(text)) { err in
      if let err = err { print("[DepthWS] send error:", err.localizedDescription) }
    }
  }

  func close() {
    task?.cancel(with: .goingAway, reason: nil)
    session?.invalidateAndCancel()
    session = nil
    task = nil
  }
}

// MARK: - AR session delegate
class DepthStreamController: NSObject, ARSessionDelegate {
  private let session = ARSession()
  private let ws = WSClient()
  private var jobId: String = ""
  private var lastSent: CFAbsoluteTime = 0
  private var targetFPS: Double = 10.0

  func start(jobId: String, backendWS: String) throws {
    self.jobId = jobId

    guard ARWorldTrackingConfiguration.supportsFrameSemantics(.sceneDepth) else {
      throw NSError(domain: "DepthCapture", code: -1, userInfo: [NSLocalizedDescriptionKey: "Device does not support sceneDepth"])
    }

    // Camera permission (best effort; ARKit will also request if needed)
    AVCaptureDevice.requestAccess(for: .video) { _ in }

    let config = ARWorldTrackingConfiguration()
    config.environmentTexturing = .none
    config.frameSemantics = [.sceneDepth, .smoothedSceneDepth] // smoothed yields cleaner maps

    // World alignment for stable gravity reference
    config.worldAlignment = .gravity

    session.delegate = self
    session.run(config, options: [.resetTracking, .removeExistingAnchors])

    // Open ws://host/ws/scan/<jobId>
    let normalized = backendWS.hasSuffix("/") ? String(backendWS.dropLast()) : backendWS
    let urlString = "\(normalized)/ws/scan/\(jobId)"
    guard let url = URL(string: urlString.replacingOccurrences(of: "http", with: "ws")) else {
      throw NSError(domain: "DepthCapture", code: -2, userInfo: [NSLocalizedDescriptionKey: "Invalid backend URL: \(backendWS)"])
    }
    ws.connect(url)
    print("[DepthCapture] Streaming → \(url.absoluteString)")
  }

  func stop() {
    session.pause()
    ws.close()
  }

  // MARK: ARSessionDelegate
  func session(_ session: ARSession, didUpdate frame: ARFrame) {
    // Throttle to targetFPS
    let now = CFAbsoluteTimeGetCurrent()
    if now - lastSent < 1.0 / targetFPS { return }
    lastSent = now

    autoreleasepool {
      guard let depth = (frame.sceneDepth ?? frame.smoothedSceneDepth) else { return }
      // Image: compress camera image to JPEG
      guard let colorJPEG = DepthStreamController.jpegData(from: frame.capturedImage, quality: 0.6) else { return }
      // Depth: encode as a compact PNG of 16-bit disparity (downscaled)
      guard let depthPNG = DepthStreamController.depthPNG(from: depth.depthMap) else { return }

      // Intrinsics and pose
      let intrinsics = frame.camera.intrinsics
      let transform = frame.camera.transform

      // Build JSON (base64 payloads)
      let payload: [String: Any] = [
        "type": "frame",
        "job_id": jobId,
        "ts": Int64(Date().timeIntervalSince1970 * 1000),
        "image_jpeg_b64": colorJPEG.base64EncodedString(),
        "depth_png_b64": depthPNG.base64EncodedString(),
        "image_size": ["w": frame.camera.imageResolution.width, "h": frame.camera.imageResolution.height],
        "depth_size": ["w": CVPixelBufferGetWidth(depth.depthMap), "h": CVPixelBufferGetHeight(depth.depthMap)],
        "intrinsics": [
          [intrinsics.columns.0.x, intrinsics.columns.0.y, intrinsics.columns.0.z],
          [intrinsics.columns.1.x, intrinsics.columns.1.y, intrinsics.columns.1.z],
          [intrinsics.columns.2.x, intrinsics.columns.2.y, intrinsics.columns.2.z]
        ],
        "camera_pose": DepthStreamController.matrixToArray(transform)
      ]

      if let json = try? JSONSerialization.data(withJSONObject: payload, options: []) {
        if let text = String(data: json, encoding: .utf8) {
          ws.send(text: text)
        }
      }
    }
  }

  // MARK: utilities
  static func jpegData(from pixelBuffer: CVPixelBuffer, quality: CGFloat) -> Data? {
    let ciImage = CIImage(cvPixelBuffer: pixelBuffer)
    let context = CIContext(options: [.useSoftwareRenderer: false])
    guard let colorSpace = CGColorSpace(name: CGColorSpace.sRGB) else { return nil }
    guard let cg = context.createCGImage(ciImage, from: ciImage.extent) else { return nil }
    let ui = UIImage(cgImage: cg, scale: 1.0, orientation: .right) // ARKit buffers are landscape; .right works for portrait device
    return ui.jpegData(compressionQuality: quality)
  }

  static func depthPNG(from depthBuffer: CVPixelBuffer) -> Data? {
    // Convert depth (float32 meters) → 16-bit disparity-ish (or normalized meters) and encode as PNG.
    CVPixelBufferLockBaseAddress(depthBuffer, .readOnly)
    defer { CVPixelBufferUnlockBaseAddress(depthBuffer, .readOnly) }

    let w = CVPixelBufferGetWidth(depthBuffer)
    let h = CVPixelBufferGetHeight(depthBuffer)
    guard let baseAddr = CVPixelBufferGetBaseAddress(depthBuffer) else { return nil }

    let floatPtr = baseAddr.bindMemory(to: Float32.self, capacity: w * h)

    // Normalize to 0..65535 within [0m, 8m]
    let maxDepth: Float32 = 8.0
    var data16 = [UInt16](repeating: 0, count: w * h)
    for i in 0..<(w*h) {
      let d = max(0.0, min(maxDepth, floatPtr[i]))
      let norm = UInt16((d / maxDepth) * Float32(UInt16.max))
      data16[i] = norm.bigEndian // big-endian for PNG
    }

    // Create CGImage from 16-bit grayscale buffer
    let bitsPerComponent = 16
    let bitsPerPixel = 16
    let bytesPerRow = w * 2
    let colorSpace = CGColorSpaceCreateDeviceGray()
    let provider = CGDataProvider(data: Data(bytes: &data16, count: data16.count * MemoryLayout<UInt16>.size) as CFData)!
    guard let cg = CGImage(width: w, height: h, bitsPerComponent: bitsPerComponent, bitsPerPixel: bitsPerPixel, bytesPerRow: bytesPerRow, space: colorSpace, bitmapInfo: CGBitmapInfo(rawValue: CGImageAlphaInfo.none.rawValue), provider: provider, decode: nil, shouldInterpolate: false, intent: .defaultIntent) else {
      return nil
    }
    let ui = UIImage(cgImage: cg)
    return ui.pngData()
  }

  static func matrixToArray(_ m: simd_float4x4) -> [[Float]] {
    return [
      [m.columns.0.x, m.columns.0.y, m.columns.0.z, m.columns.0.w],
      [m.columns.1.x, m.columns.1.y, m.columns.1.z, m.columns.1.w],
      [m.columns.2.x, m.columns.2.y, m.columns.2.z, m.columns.2.w],
      [m.columns.3.x, m.columns.3.y, m.columns.3.z, m.columns.3.w]
    ]
  }
}

// MARK: - Expo Module
public class DepthCaptureModule: Module {
  private let controller = DepthStreamController()

  public func definition() -> ModuleDefinition {
    Name("DepthCaptureModule")

    AsyncFunction("start") { (jobId: String, backendURL: String) -> String in
      try self.controller.start(jobId: jobId, backendWS: backendURL)
      return "started"
    }

    AsyncFunction("stop") { () -> String in
      self.controller.stop()
      return "stopped"
    }
  }
}
