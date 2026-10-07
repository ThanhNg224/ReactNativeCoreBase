import type { ExpoConfig } from 'expo/config';

const baseBundleId = 'dev.thanhng224.rncorebase';
const baseName = 'CoreBase';
const config: ExpoConfig = {
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  userInterfaceStyle: 'automatic',
  ios: {
    icon: './assets/expo.icon',
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#208AEF',
        image: './assets/images/splash-icon.png',
        imageWidth: 76,
      },
    ],
    'expo-dev-client',
    'expo-secure-store',
    'expo-localization',
    './plugins/with-android-build-performance',
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  platforms: ['ios', 'android'],
  name: baseName,
  slug: 'react-native-core-base',
  scheme: 'rncorebase',
  extra: {
    apiBaseUrl: 'https://dummyjson.com',
  },
};
config.ios = { ...config.ios, bundleIdentifier: baseBundleId };
config.android = { ...config.android, package: baseBundleId };
export default config;
