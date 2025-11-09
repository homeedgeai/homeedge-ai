module.exports = function (api) {
  api.cache(true);

  return {
    presets: ['babel-preset-expo'], // ✅ includes Expo Router support by default
    plugins: [
      // 👇 Keep Reanimated plugin last
      'react-native-reanimated/plugin',
    ],
  };
};
