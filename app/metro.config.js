const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Enable package exports for better module resolution
config.resolver.unstable_enablePackageExports = true;

// Add mjs and cjs for better library compatibility (Fixes Lucide icons)
config.resolver.sourceExts = [...config.resolver.sourceExts, "mjs", "cjs"];

module.exports = withNativeWind(config, { input: "./global.css" });