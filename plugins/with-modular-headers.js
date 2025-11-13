const { withDangerousMod, withPlugins } = require('@expo/config-plugins');
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
          contents = contents.replace(
            /require expo_package/,
            'require expo_package\nuse_modular_headers!' // Inject directive
          );
          fs.writeFileSync(podfilePath, contents);
          console.log('✅ Added use_modular_headers! to Podfile');
        }
      }
      return config;
    },
  ]);
};

module.exports = withModularHeaders;
