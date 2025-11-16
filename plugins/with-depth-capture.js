// plugins/with-depth-capture.js
const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

function withDepthCapture(config) {
  // Ensure ios config object exists
  config.ios = config.ios || {};

  // RoomPlan requires iOS 16+
  config.ios.deploymentTarget = "16.0";

  // Make sure we have camera usage strings
  config.ios.infoPlist = config.ios.infoPlist || {};
  config.ios.infoPlist.NSCameraUsageDescription =
    config.ios.infoPlist.NSCameraUsageDescription ||
    "We use the camera and LiDAR scanner to capture rooms in 3D.";
  config.ios.infoPlist.NSMotionUsageDescription =
    config.ios.infoPlist.NSMotionUsageDescription ||
    "We use device motion to improve the accuracy of 3D room scans.";

  // Copy our Swift module into the generated ios project
  return withDangerousMod(config, [
    "ios",
    (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const src = path.join(
        projectRoot,
        "src-native",
        "ios",
        "DepthCaptureModule.swift"
      );
      const iosDir = path.join(projectRoot, "ios");
      const dest = path.join(iosDir, "DepthCaptureModule.swift");

      if (!fs.existsSync(src)) {
        console.warn(
          "[with-depth-capture] DepthCaptureModule.swift not found at",
          src
        );
        return config;
      }

      if (!fs.existsSync(iosDir)) {
        fs.mkdirSync(iosDir);
      }

      fs.copyFileSync(src, dest);
      console.log(
        "[with-depth-capture] Copied DepthCaptureModule.swift into ios project."
      );

      return config;
    },
  ]);
}

module.exports = withDepthCapture;
