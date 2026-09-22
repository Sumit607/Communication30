import { Platform } from 'react-native';
// Keep the browser design review separate from real Android data and capture.
// eslint-disable-next-line @typescript-eslint/no-require-imports
if (Platform.OS === 'web') require('./preview');
// eslint-disable-next-line @typescript-eslint/no-require-imports
else require('expo-router/entry');
