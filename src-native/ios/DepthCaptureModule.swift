import ExpoModulesCore
import UIKit
import RoomPlan
import ARKit

// iOS UI for RoomPlan scanning
@available(iOS 16.0, *)
class RoomScanViewController: UIViewController, RoomCaptureViewDelegate {

  private var onComplete: ([String: Any]) -> Void
  private var onCancel: () -> Void

  private var captureView: RoomCaptureView!
  private var hasFinished = false

  init(onComplete: @escaping ([String: Any]) -> Void,
       onCancel: @escaping () -> Void) {
    self.onComplete = onComplete
    self.onCancel = onCancel
    super.init(nibName: nil, bundle: nil)
  }

  required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }

  override func loadView() {
    // Full-screen RoomPlan capture view
    captureView = RoomCaptureView(frame: .zero)
    captureView.delegate = self
    view = captureView
  }

  override func viewDidAppear(_ animated: Bool) {
    super.viewDidAppear(animated)

    // Start the capture session when the view appears
    captureView.captureSession.run(configuration: RoomCaptureSession.Configuration())
  }

  // Called when RoomPlan has a processed room result ready
  func captureView(_ view: RoomCaptureView,
                   didPresent processedResult: CapturedRoom,
                   error: Error?) {

    hasFinished = true

    if let error = error {
      dismiss(animated: true) {
        self.onComplete([
          "error": error.localizedDescription
        ])
      }
      return
    }

    // Export as a USDZ file to a temporary location
    let tmpURL = FileManager.default
      .temporaryDirectory
      .appendingPathComponent("room-\(UUID().uuidString).usdz")

    do {
      try processedResult.export(to: tmpURL)

      let payload: [String: Any] = [
        "usdzUrl": tmpURL.path  // local file path
      ]

      dismiss(animated: true) {
        self.onComplete(payload)
      }
    } catch {
      dismiss(animated: true) {
        self.onComplete([
          "error": error.localizedDescription
        ])
      }
    }
  }

  override func viewDidDisappear(_ animated: Bool) {
    super.viewDidDisappear(animated)

    // If the user dismissed without a finished scan, treat as cancel
    if !hasFinished {
      onCancel()
    }
  }
}

// Expo module that JS talks to: DepthCaptureModule.start / stop
public class DepthCaptureModule: Module {

  private var currentPromise: Promise?

  public func definition() -> ModuleDefinition {
    Name("DepthCaptureModule")

    // start(jobId, backendUrl)
    AsyncFunction("start") { (jobId: String, backendUrl: String, promise: Promise) in
      self.startCapture(jobId: jobId, backendUrl: backendUrl, promise: promise)
    }

    // stop()
    AsyncFunction("stop") { (promise: Promise) in
      self.stopCapture(promise: promise)
    }
  }

  private func findRootViewController() -> UIViewController? {
    // Support multiple scenes (iOS 13+)
    let scenes = UIApplication.shared.connectedScenes
      .compactMap { $0 as? UIWindowScene }

    if let window = scenes.first?.windows.first(where: { $0.isKeyWindow }) {
      return window.rootViewController
    }

    // Fallback for older style
    return UIApplication.shared.keyWindow?.rootViewController
  }

  private func startCapture(jobId: String, backendUrl: String, promise: Promise) {
    guard #available(iOS 16.0, *) else {
      promise.reject(
        "ROOMPLAN_UNAVAILABLE",
        "RoomPlan requires iOS 16 and a LiDAR-enabled device.",
        nil
      )
      return
    }

    guard ARWorldTrackingConfiguration.supportsFrameSemantics(.sceneDepth) else {
      promise.reject(
        "LIDAR_UNAVAILABLE",
        "This device does not support LiDAR depth scanning.",
        nil
      )
      return
    }

    DispatchQueue.main.async {
      guard let rootVC = self.findRootViewController() else {
        promise.reject(
          "NO_ROOT_VIEW_CONTROLLER",
          "Unable to find root view controller to present RoomPlan UI.",
          nil
        )
        return
      }

      self.currentPromise = promise

      let scannerVC = RoomScanViewController(
        onComplete: { payload in
          // You can later post payload + jobId/backendUrl to your backend from JS.
          self.currentPromise?.resolve(payload)
          self.currentPromise = nil
        },
        onCancel: {
          self.currentPromise?.reject(
            "SCAN_CANCELLED",
            "User cancelled room scan.",
            nil
          )
          self.currentPromise = nil
        }
      )

      scannerVC.modalPresentationStyle = .fullScreen
      rootVC.present(scannerVC, animated: true, completion: nil)
    }
  }

  private func stopCapture(promise: Promise) {
    DispatchQueue.main.async {
      guard let rootVC = self.findRootViewController() else {
        promise.resolve(nil)
        return
      }

      if let presented = rootVC.presentedViewController,
         presented is RoomScanViewController {
        presented.dismiss(animated: true) {
          self.currentPromise?.reject(
            "SCAN_STOPPED",
            "Scan was stopped programmatically.",
            nil
          )
          self.currentPromise = nil
          promise.resolve(nil)
        }
      } else {
        promise.resolve(nil)
      }
    }
  }
}
