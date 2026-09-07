import * as SecureStore from 'expo-secure-store';
const KEY = 'take-two.gemini-key';
export async function saveCredential(key: string) {
  if (!(await SecureStore.isAvailableAsync()))
    throw new Error('Secure key storage requires the Android app.');
  if (key.trim().length < 20) throw new Error('Enter a valid API key.');
  await SecureStore.setItemAsync(KEY, key.trim());
}
export async function getCredential() {
  if (!(await SecureStore.isAvailableAsync())) return null;
  return SecureStore.getItemAsync(KEY);
}
export async function clearCredential() {
  if (await SecureStore.isAvailableAsync()) await SecureStore.deleteItemAsync(KEY);
}
