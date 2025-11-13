const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const withModularHeaders = (config) => {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.projectRoot, 'ios', 'Podfile');

      if (fs.existsSync(podfilePath)) {
        let contents = fs.readFileSync(podfilePath, 'utf-8');

        if (!contents.includes('use_modular_headers!')) {
          // Insert just after the 'require' line that Expo adds
          contents = contents.replace(
            /(require\s+File\.join[^\n]+)/,
            '$1\nuse_modular_headers!' // Add below the require line
          );

          fs.writeFileSync(podfilePath, contents);
          console.log('✅ Successfully added use_modular_headers! to Podfile');
        } else {
          console.log('ℹ️ use_modular_headers! already exists in Podfile');
        }
      } else {
        console.warn('⚠️ Podfile not found — skipping modular header injection.');
      }

      return config;
    },
  ]);
};

module.exports = withModularHeaders;
