import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Take Two',
  slug: 'take-two',
  owner: 'sumitghode607',
  scheme: 'take-two',
  platforms: ['android', 'web'],
  plugins: [
    'expo-router',
    'expo-sqlite',
    'expo-secure-store',
    'expo-sharing',
    'expo-asset',
    [
      'expo-camera',
      {
        cameraPermission: 'Take Two records speaking practice on this phone.',
        microphonePermission: 'Take Two records your voice for your speaking practice.',
        recordAudioAndroid: true,
      },
    ],
    ['expo-video', { supportsBackgroundPlayback: false, supportsPictureInPicture: false }],
    'expo-local-authentication',
    'expo-notifications',
  ],
  experiments: { typedRoutes: true },
  version: '1.0.1',
  orientation: 'portrait',
  icon: './assets/icons/icon.png',
  userInterfaceStyle: 'light',
  ios: { supportsTablet: true },
  android: {
    package: 'com.sumitghode607.taketwo',
    versionCode: 2,
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
  extra: { eas: { projectId: 'bdae1b4a-00e8-48d3-81d3-61f714db5449' } },
};

export default config;
