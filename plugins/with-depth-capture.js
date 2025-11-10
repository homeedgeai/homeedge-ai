const {
  withPlugins,
  withInfoPlist,
  withDangerousMod,
  withXcodeProject,
} = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

const withCopySwift = (config) =>
  withDangerousMod(config, [
    "ios",
    async (cfg) => {
      const projectRoot = cfg.modRequest.projectRoot;           // <-- REPO ROOT (correct)
      const platformProjectRoot = cfg.modRequest.platformProjectRoot; // <-- GENERATED ios/

      // SOURCE: from your committed repo
      const src = path.join(projectRoot, "ios", "DepthCaptureModule.swift");
      // DESTINATION: into the generated Xcode project
      const dest = path.join(platformProjectRoot, "DepthCaptureModule.swift");

      if (!fs.existsSync(src)) {
        throw new Error(
          `[with-depth-capture] Missing file!\n` +
          `Expected: ${src}\n` +
          `→ Commit ios/DepthCaptureModule.swift to your Git repo.\n` +
          `   This file must be tracked by Git for EAS Build to see it.`
        );
      }

      fs.copyFileSync(src, dest);
      console.log("Copied DepthCaptureModule.swift → Xcode project");
      return cfg;
    },
  ]);

const withCameraPermissions = (config) =>
  withInfoPlist(config, (cfg) => {
    cfg.modResults.NSCameraUsageDescription ||= "HomeEdge AI uses the camera and LiDAR to scan rooms and capture depth.";
    cfg.modResults.NSMicrophoneUsageDescription ||= "Used for ambient data capture in ARKit.";
    cfg.modResults.NSMotionUsageDescription ||= "Used to track device motion for accurate AR scanning.";
    cfg.modResults.NSPhotoLibraryAddUsageDescription ||= "Save generated 3D floorplans to your photo library.";
    cfg.modResults.NSLocationWhenInUseUsageDescription ||= "Used for AR alignment during room scanning.";
    return cfg;
  });

const withARKit = (config) =>
  withXcodeProject(config, (cfg) => {
    const proj = cfg.modResults;
    const framework = "ARKit.framework";
    if (!proj.hasFile(framework)) {
      proj.addFramework(framework);
      console.log("Linked ARKit.framework");
    }

    for (const key in proj.pbxXCBuildConfigurationSection()) {
      const item = proj.pbxXCBuildConfigurationSection()[key];
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