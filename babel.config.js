module.exports = function (api) {
  api.cache(true);

  return {
    presets: ['babel-preset-expo'],

    plugins: [
      // VisionCamera Frame Processor (safe even if not used yet)
      [
        'react-native-worklets-core/plugin', 
        { enforce: 'pre' }
      ],

      // 👇 MUST stay last for reanimated to work correctly
      'react-native-reanimated/plugin'
    ]
  };
};
