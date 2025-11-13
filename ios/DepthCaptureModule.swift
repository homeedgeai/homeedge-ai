// DepthCaptureModule.swift
// Expo Module for ARKit LiDAR Streaming
// Twin — this is your Polycam-level pipeline ❤️

import ExpoModulesCore
import ARKit
import Foundation

public class DepthCaptureModule: Module {
  public func definition() -> ModuleDefinition {
    Name("DepthCaptureModule")

    Function("start") { (jobId: String, backendURL: String) in
      DepthCaptureController.shared.start(jobId: jobId, backendURL: backendURL)
      return "started"
    }

    Function("stop") {
      DepthCaptureController.shared.stop()
      return "stopped"
    }
  }
}

// ─────────────────────────────────────────────────────────────
// MARK: - LiDAR Capture Controller
// ─────────────────────────────────────────────────────────────

class DepthCaptureController: NSObject, ARSessionDelegate {

  static let shared = DepthCaptureController()
  private override init() {}

  private var session: ARSession?
  private var socket: URLSessionWebSocketTask?
  private var running = false
  private var jobId: String = ""
  private var baseURL: String = ""

  // ─────────────────────────────────────────────
  // MARK: START
  // ─────────────────────────────────────────────
  func start(jobId: String, backendURL: String) {
    if running { return }

    self.jobId = jobId
    self.baseURL = backendURL

    let url = URL(string: "\(backendURL)/ws/frames/\(jobId)")!
    socket = URLSession(configuration: .default)
      .webSocketTask(with: url)
    socket?.resume()

    let configuration = ARWorldTrackingConfiguration()

    // Depth
    configuration.frameSemantics = [.sceneDepth]

    // Smoothest possible AR tracking
    configuration.worldAlignment = .gravity
    configuration.planeDetection = [.horizontal, .vertical]

    let session = ARSession()
    session.delegate = self
    session.run(configuration, options: [.resetTracking, .removeExistingAnchors])

    self.session = session
    self.running = true

    print("🔥 DepthCapture: Started ARKit session")
  }

  // ─────────────────────────────────────────────
  // MARK: STOP
  // ─────────────────────────────────────────────
  func stop() {
    guard running else { return }

    socket?.cancel(with: .goingAway, reason: nil)
    socket = nil

    session?.pause()
    session = nil

    running = false
    print("🛑 DepthCapture: Stopped session")
  }

  // ─────────────────────────────────────────────
  // MARK: ARSession Delegate → Called EVERY FRAME
  // ─────────────────────────────────────────────
  func session(_ session: ARSession, didUpdate frame: ARFrame) {
    guard running else { return }

    // Depth map
    guard let depthData = frame.sceneDepth?.depthMap else { return }

    // Camera image
    let pixelBuffer = frame.capturedImage

    // Convert pose (4x4 matrix) to JSON
    let transform = frame.camera.transform
    let pose = [
      transform.columns.0.x, transform.columns.0.y, transform.columns.0.z, transform.columns.0.w,
      transform.columns.1.x, transform.columns.1.y, transform.columns.1.z, transform.columns.1.w,
      transform.columns.2.x, transform.columns.2.y, transform.columns.2.z, transform.columns.2.w,
      transform.columns.3.x, transform.columns.3.y, transform.columns.3.z, transform.columns.3.w
    ]

    // Camera intrinsics
    let intrinsics = frame.camera.intrinsics
    let fx = intrinsics[0][0]
    let fy = intrinsics[1][1]
    let cx = intrinsics[0][2]
    let cy = intrinsics[1][2]

    // Serialize depth map to a compressed binary blob
    guard let depthDataBase64 = depthData.toBase64() else { return }

    // Serialize camera image to JPEG → base64
    guard let imageDataBase64 = pixelBuffer.toJPEGBase64() else { return }

    let timestamp = frame.timestamp

    // Create JSON payload
    let payload: [String: Any] = [
      "jobId": jobId,
      "timestamp": timestamp,
      "pose": pose,
      "intrinsics": [
        "fx": fx,
        "fy": fy,
        "cx": cx,
        "cy": cy
      ],
      "depth": depthDataBase64,
      "image": imageDataBase64
    ]

    // Send to backend
    sendJSON(payload)
  }

  private func sendJSON(_ dict: [String: Any]) {
    guard let socket = socket else { return }
    guard let json = try? JSONSerialization.data(withJSONObject: dict) else { return }
    let message = URLSessionWebSocketTask.Message.data(json)
    socket.send(message) { error in
      if let error = error {
        print("❌ WebSocket send error:", error.localizedDescription)
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────
// MARK: - Pixel Buffer → JPEG Base64
// ─────────────────────────────────────────────────────────────

extension CVPixelBuffer {
  func toJPEGBase64() -> String? {
    var ciImage = CIImage(cvPixelBuffer: self)
    let context = CIContext()

    guard let colorSpace = CGColorSpace(name: CGColorSpace.sRGB) else { return nil }
    guard let cgImage = context.createCGImage(ciImage, from: ciImage.extent, format: .RGBA8, colorSpace: colorSpace) else { return nil }

    let uiImage = UIImage(cgImage: cgImage)
    guard let jpegData = uiImage.jpegData(compressionQuality: 0.7) else { return nil }

    return jpegData.base64EncodedString()
  }
}

// ─────────────────────────────────────────────────────────────
// MARK: - Depth map → Float32 → Base64
// ─────────────────────────────────────────────────────────────

extension CVPixelBuffer {
  func toBase64() -> String? {
    CVPixelBufferLockBaseAddress(self, .readOnly)

    guard let baseAddress = CVPixelBufferGetBaseAddress(self) else {
      CVPixelBufferUnlockBaseAddress(self, .readOnly)
      return nil
    }

    let length = CVPixelBufferGetDataSize(self)
    let data = Data(bytes: baseAddress, count: length)
    CVPixelBufferUnlockBaseAddress(self, .readOnly)

    return data.base64EncodedString()
  }
}
