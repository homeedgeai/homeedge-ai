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
 */
const withCopySwift = (config) =>
  withDangerousMod(config, [
    "ios",
    async (cfg) => {
      const projectRoot = cfg.modRequest.projectRoot;
      const platformProjectRoot = cfg.modRequest.platformProjectRoot; // THIS IS KEY

      // Source: from your repo root (where the file actually exists)
      const src = path.join(projectRoot, "ios", "DepthCaptureModule.swift");

      // Destination: inside the generated Xcode project
      const dest = path.join(platformProjectRoot, "DepthCaptureModule.swift");

      if (!fs.existsSync(src)) {
        throw new Error(
          `[with-depth-capture] ios/DepthCaptureModule.swift not found.\n` +
          `→ Make sure the file exists and is committed to your repo.\n` +
          `Path should be: ${src}`
        );
      }

      fs.copyFileSync(src, dest);
      console.log("Copied DepthCaptureModule.swift into iOS project");
      return cfg;
    },
  ]);

const withCameraPermissions = (config) =>
  withInfoPlist(config, (cfg) => {
    const desc = "HomeEdge AI uses the camera and LiDAR to scan rooms and capture depth.";
    cfg.modResults.NSCameraUsageDescription ||= desc;
    cfg.modResults.NSMicrophoneUsageDescription ||= "Used for ambient data capture in ARKit.";
    cfg.modResults.NSMotionUsageDescription ||= "Used to track device motion for accurate AR scanning.";
    cfg.modResults.NSPhotoLibraryAddUsageDescription ||= "Save generated 3D floorplans to your photo library.";
    return cfg;
  });

const withARKit = (config) =>
  withXcodeProject(config, (cfg) => {
    const proj = cfg.modResults;

    // Link ARKit.framework
    const frameworkName = "ARKit.framework";
    if (!proj.hasFile(frameworkName)) {
      proj.addFramework(frameworkName);
      console.log("Linked ARKit.framework");
    } else {
      console.log("ARKit.framework already linked");
    }

    // Set deployment target to 13.0
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