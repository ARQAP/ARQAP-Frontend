const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// enable importing .svg as React components via react-native-svg-transformer
config.resolver = config.resolver || {};
config.resolver.assetExts = (config.resolver.assetExts || []).filter(ext => ext !== 'svg');
config.resolver.sourceExts = Array.from(new Set([...(config.resolver.sourceExts || []), 'svg']));

config.transformer = config.transformer || {};
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');

module.exports = withNativeWind(config, { input: './global.css' });