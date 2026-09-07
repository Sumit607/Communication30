import { Platform } from 'react-native';
// Keep the browser design review separate from real Android data and capture.
if (Platform.OS === 'web') require('./preview');
else require('expo-router/entry');
