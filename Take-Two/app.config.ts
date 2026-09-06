import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Take Two',
  slug: 'take-two',
  scheme: 'take-two',
  platforms: ['android'],
  plugins: ['expo-router', 'expo-sqlite', 'expo-secure-store', 'expo-sharing', 'expo-asset'],
  experiments: { typedRoutes: true },
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icons/icon.png',
  userInterfaceStyle: 'light',
  ios: { supportsTablet: true },
  android: {
    // Placeholder identity: replace before registering an EAS/release application.
    package: 'com.example.taketwo',
    allowBackup: false,
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/icons/android-icon-foreground.png',
      backgroundImage: './assets/icons/android-icon-background.png',
      monochromeImage: './assets/icons/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: { favicon: './assets/icons/favicon.png' },
};

export default config;
