// plugins/with-modular-headers.js
const {
  withDangerousMod,
} = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

module.exports = function withModularHeaders(config) {
  return withDangerousMod(config, [
    "ios",
    (config) => {
      const podfile = path.join(config.modRequest.platformProjectRoot, "Podfile");

      let contents = fs.readFileSync(podfile, "utf-8");

      // Add use_modular_headers! if not already set
      if (!contents.includes("use_modular_headers!")) {
        contents = contents.replace(
          "use_frameworks!",
          "use_frameworks!\n  use_modular_headers!"
        );
      }

      // Apply to specific pods (FirebaseCoreInternal, GoogleUtilities)
      if (!contents.includes("modular_headers => true")) {
        contents = contents.replace(
          /pod ['"]FirebaseCoreInternal['"].*$/m,
          `pod 'FirebaseCoreInternal', :modular_headers => true`
        );

        contents = contents.replace(
          /pod ['"]GoogleUtilities['"].*$/m,
          `pod 'GoogleUtilities', :modular_headers => true`
        );
      }

      fs.writeFileSync(podfile, contents);
      return config;
    },
  ]);
};
