
// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");

// Get Expo's default Metro configuration
const config = getDefaultConfig(__dirname);

// Do NOT manually modify resolver or assetExts unless absolutely necessary.
// Expo automatically includes all defaults (ts, tsx, js, jsx, json, cjs, etc.)
module.exports = config;
