module.exports = function (api) {
  api.cache(true);

  return {
    presets: ["babel-preset-expo"],

    plugins: [
      // VisionCamera Worklets Core plugin
      [
        "react-native-worklets-core/plugin",
        { enforce: "pre" }
      ],

      // ❌ REMOVED react-native-dotenv (BREAKS EAS)

      // Reanimated must stay last
      "react-native-reanimated/plugin",
    ],
  };
};
