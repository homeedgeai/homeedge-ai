const {
  withPlugins,
  withInfoPlist,
  withDangerousMod,
  withXcodeProject,
} = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

/**
 * Copies DepthCaptureModule.swift from src-native/ios into the Xcode project
 */
const withCopySwift = (config) =>
  withDangerousMod(config, [
    "ios",
    async (cfg) => {
      const projectRoot = cfg.modRequest.projectRoot;
      const platformProjectRoot = cfg.modRequest.platformProjectRoot;

      const src = path.join(projectRoot, "src-native", "ios", "DepthCaptureModule.swift");
      const dest = path.join(platformProjectRoot, "DepthCaptureModule.swift");

      if (!fs.existsSync(src)) {
        throw new Error(
          `[with-depth-capture] Missing file!\n` +
          `Expected: ${src}\n` +
          `→ Commit src-native/ios/DepthCaptureModule.swift to Git repo.\n` +
          `   Check: https://github.com/homeedgeai/homeedge-ai/tree/main/src-native/ios`
        );
      }

      fs.copyFileSync(src, dest);
      console.log("Copied DepthCaptureModule.swift from src-native/ios → Xcode project");
      return cfg;
    },
  ]);

/**
 * Adds permissions to Info.plist
 */
const withCameraPermissions = (config) =>
  withInfoPlist(config, (cfg) => {
    cfg.modResults.NSCameraUsageDescription ||= "HomeEdge AI uses the camera and LiDAR to scan rooms and capture depth.";
    cfg.modResults.NSMicrophoneUsageDescription ||= "Used for ambient data capture in ARKit.";
    cfg.modResults.NSMotionUsageDescription ||= "Used to track device motion for accurate AR scanning.";
    cfg.modResults.NSPhotoLibraryAddUsageDescription ||= "Save generated 3D floorplans to your photo library.";
    cfg.modResults.NSLocationWhenInUseUsageDescription ||= "Used for AR alignment during room scanning.";
    return cfg;
  });

/**
 * Links ARKit and sets deployment target
 */
const withARKit = (config) =>
  withXcodeProject(config, (cfg) => {
    const proj = cfg.modResults;
    const framework = "ARKit.framework";
    if (!proj.hasFile(framework)) {
      proj.addFramework(framework);
      console.log("Linked ARKit.framework");
    } else {
      console.log("ARKit.framework already linked");
    }

    const configurations = proj.pbxXCBuildConfigurationSection();
    for (const key in configurations) {
      const item = configurations[key];
      if (item.buildSettings?.IPHONEOS_DEPLOYMENT_TARGET) {
        item.buildSettings.IPHONEOS_DEPLOYMENT_TARGET = "13.0";
      }
    }
    return cfg;
  });

module.exports = function withDepthCapture(config) {
  return withPlugins(config, [
    withCopySwift,
    withCameraPermissions,
    withARKit,
  ]);
};