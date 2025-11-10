const {
  withPlugins,
  withInfoPlist,
  withDangerousMod,
  withXcodeProject,
} = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

/**
 * Copies DepthCaptureModule.swift from repo into the generated Xcode project
 * Uses correct paths for EAS Build (projectRoot vs platformProjectRoot)
 */
const withCopySwift = (config) =>
  withDangerousMod(config, [
    "ios",
    async (cfg) => {
      const projectRoot = cfg.modRequest.projectRoot;           // Your repo root
      const platformProjectRoot = cfg.modRequest.platformProjectRoot; // Generated ios/

      const src = path.join(projectRoot, "ios", "DepthCaptureModule.swift");
      const dest = path.join(platformProjectRoot, "DepthCaptureModule.swift");

      if (!fs.existsSync(src)) {
        throw new Error(
          `[with-depth-capture] Missing file!\n` +
          `Expected: ${src}\n` +
          `→ Commit ios/DepthCaptureModule.swift to your Git repo.\n` +
          `   This file must be tracked by Git for EAS Build to see it.`
        );
      }

      try {
        fs.copyFileSync(src, dest);
        console.log("Copied DepthCaptureModule.swift → Xcode project");
      } catch (err) {
        throw new Error(`Failed to copy DepthCaptureModule.swift: ${err.message}`);
      }

      return cfg;
    },
  ]);

/**
 * Ensures all required privacy descriptions are present
 */
const withCameraPermissions = (config) =>
  withInfoPlist(config, (cfg) => {
    const cameraDesc = "HomeEdge AI uses the camera and LiDAR to scan rooms and capture depth.";
    cfg.modResults.NSCameraUsageDescription ||= cameraDesc;
    cfg.modResults.NSMicrophoneUsageDescription ||= "Used for ambient data capture in ARKit.";
    cfg.modResults.NSMotionUsageDescription ||= "Used to track device motion for accurate AR scanning.";
    cfg.modResults.NSPhotoLibraryAddUsageDescription ||= "Save generated 3D floorplans to your photo library.";
    cfg.modResults.NSLocationWhenInUseUsageDescription ||= "Used for AR alignment during room scanning.";
    return cfg;
  });

/**
 * Links ARKit.framework and forces iOS 13.0+ deployment target
 */
const withARKit = (config) =>
  withXcodeProject(config, (cfg) => {
    const xcodeProject = cfg.modResults;

    // Link ARKit.framework
    const frameworkName = "ARKit.framework";
    if (!xcodeProject.hasFile(frameworkName)) {
      xcodeProject.addFramework(frameworkName);
      console.log("Linked ARKit.framework");
    } else {
      console.log("ARKit.framework already linked");
    }

    // Force iOS 13.0 minimum (required for sceneDepth)
    const configs = xcodeProject.pbxXCBuildConfigurationSection();
    for (const key in configs) {
      const item = configs[key];
      if (item.buildSettings?.IPHONEOS_DEPLOYMENT_TARGET) {
        if (parseFloat(item.buildSettings.IPHONEOS_DEPLOYMENT_TARGET) < 13.0) {
          item.buildSettings.IPHONEOS_DEPLOYMENT_TARGET = "13.0";
          console.log("Set IPHONEOS_DEPLOYMENT_TARGET = 13.0");
        }
      }
    }

    return cfg;
  });

/**
 * Main plugin — combines all sub-plugins
 */
module.exports = function withDepthCapture(config) {
  return withPlugins(config, [
    withCopySwift,
    withCameraPermissions,
    withARKit,
  ]);
};