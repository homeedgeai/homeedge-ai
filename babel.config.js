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

      // 🔥 Load .env variables using @env
      [
        "module:react-native-dotenv",
        {
          moduleName: "@env",
          path: ".env",
        }
      ],

      // MUST stay last for Reanimated to work
      "react-native-reanimated/plugin",
    ],
  };
};
