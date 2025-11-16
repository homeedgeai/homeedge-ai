const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

module.exports = function withModularHeaders(config) {
  return withDangerousMod(config, [
    "ios",
    (cfg) => {
      const podfilePath = path.join(
        cfg.modRequest.platformProjectRoot,
        "Podfile"
      );

      let contents = fs.readFileSync(podfilePath, "utf-8");

      // Ensure use_frameworks! exists
      if (!contents.includes("use_frameworks!")) {
        contents = contents.replace(
          "platform :ios",
          "platform :ios\n  use_frameworks!"
        );
      }

      // Ensure modular headers
      if (!contents.includes("use_modular_headers!")) {
        contents = contents.replace(
          "use_frameworks!",
          "use_frameworks!\n  use_modular_headers!"
        );
      }

      // Patch individual pods
      const podsToPatch = [
        "FirebaseCoreInternal",
        "FirebaseCoreExtension",
        "GoogleUtilities",
        "GoogleMaps",
        "GoogleMapsBase",
      ];

      podsToPatch.forEach((pod) => {
        const regex = new RegExp(`pod ['"]${pod}['"].*$`, "m");
        if (regex.test(contents)) {
          contents = contents.replace(
            regex,
            `pod '${pod}', :modular_headers => true`
          );
        }
      });

      fs.writeFileSync(podfilePath, contents);
      console.log("🔧 Updated Podfile with modular_headers");

      return cfg;
    },
  ]);
};
