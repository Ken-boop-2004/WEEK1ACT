const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for worklets
config.resolver.alias = {
  ...config.resolver.alias,
  'react-native-worklets': 'react-native-worklets',
};

module.exports = config;



