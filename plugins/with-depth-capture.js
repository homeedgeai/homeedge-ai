const {
  withPlugins,
  withInfoPlist,
  withDangerousMod,
  withXcodeProject,
} = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

/**
 * Copies DepthCaptureModule.swift into the iOS project
 * after Expo's prebuild (so ARKit compiles in EAS).
 */
const withCopySwift = (config) =>
  withDangerousMod(config, [
    "ios",
    async (cfg) => {
      const projectRoot = cfg.modRequest.projectRoot;
      const iosDir = path.join(projectRoot, "ios");
      const src = path.join(iosDir, "DepthCaptureModule.swift");

      if (!fs.existsSync(src)) {
        throw new Error(
          "[with-depth-capture] ios/DepthCaptureModule.swift not found.\n" +
            "→ Make sure the file exists and is committed to your repo.\n" +
            "Path should be: <projectRoot>/ios/DepthCaptureModule.swift"
        );
      }

      const dest = path.join(iosDir, "DepthCaptureModule.swift");
      fs.copyFileSync(src, dest);
      console.log("✅ Copied DepthCaptureModule.swift into iOS project");
      return cfg;
    },
  ]);

/**
 * Adds required camera + motion + LiDAR permissions to Info.plist
 */
const withCameraPermissions = (config) =>
  withInfoPlist(config, (cfg) => {
    cfg.modResults.NSCameraUsageDescription =
      cfg.modResults.NSCameraUsageDescription ||
      "HomeEdge AI uses the camera and LiDAR to scan rooms and capture depth.";
    cfg.modResults.NSMicrophoneUsageDescription =
      cfg.modResults.NSMicrophoneUsageDescription ||
      "Used for ambient data capture in ARKit.";
    cfg.modResults.NSMotionUsageDescription =
      cfg.modResults.NSMotionUsageDescription ||
      "Used to track device motion for accurate AR scanning.";
    cfg.modResults.NSPhotoLibraryAddUsageDescription =
      cfg.modResults.NSPhotoLibraryAddUsageDescription ||
      "Save generated 3D floorplans to your photo library.";
    return cfg;
  });

/**
 * Links ARKit.framework + sets iOS Deployment Target
 */
const withARKit = (config) =>
  withXcodeProject(config, (cfg) => {
    const proj = cfg.modResults;

    // Attempt to link ARKit
    try {
      proj.addFramework("ARKit.framework", {
        target: proj.getFirstTarget().uuid,
        link: true,
      });
      console.log("✅ Linked ARKit.framework");
    } catch (e) {
      console.log("ℹ️ ARKit.framework already linked");
    }

    // Force iOS 13+ for LiDAR
    const configurations = proj.pbxXCBuildConfigurationSection();
    Object.keys(configurations).forEach((key) => {
      const item = configurations[key];
      if (
        item?.buildSettings &&
        item.buildSettings.IPHONEOS_DEPLOYMENT_TARGET
      ) {
        item.buildSettings.IPHONEOS_DEPLOYMENT_TARGET = "13.0";
      }
    });

    return cfg;
  });

/**
 * Combine the sub-plugins
 */
module.exports = function withDepthCapture(config) {
  return withPlugins(config, [
    withCopySwift,
    withCameraPermissions,
    withARKit,
  ]);
};
