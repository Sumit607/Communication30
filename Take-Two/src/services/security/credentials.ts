import * as SecureStore from 'expo-secure-store';
import { personalBuildKey } from './personal-build-key';
const KEY = 'take-two.gemini-key';
const DISABLED = 'take-two.gemini-key-disabled';
let pending: Promise<unknown> = Promise.resolve();

function serial<T>(action: () => Promise<T>): Promise<T> {
  const next = pending.then(action, action);
  pending = next.catch(() => undefined);
  return next;
}

export async function saveCredential(key: string) {
  return serial(async () => {
    if (!(await SecureStore.isAvailableAsync()))
      throw new Error('Secure key storage requires the Android app.');
    if (key.trim().length < 20) throw new Error('Enter a valid API key.');
    await SecureStore.setItemAsync(KEY, key.trim());
    await SecureStore.deleteItemAsync(DISABLED);
  });
}
export async function getCredential() {
  return serial(async () => {
    if (!(await SecureStore.isAvailableAsync())) return null;
    if (await SecureStore.getItemAsync(DISABLED)) return null;
    const saved = await SecureStore.getItemAsync(KEY);
    if (saved) return saved;
    if (!personalBuildKey) return null;
    await SecureStore.setItemAsync(KEY, personalBuildKey);
    return personalBuildKey;
  });
}
export async function clearCredential() {
  return serial(async () => {
    if (!(await SecureStore.isAvailableAsync())) return;
    // Persist opt-out before deleting so a later launch cannot silently restore the bundled key.
    await SecureStore.setItemAsync(DISABLED, 'true');
    await SecureStore.deleteItemAsync(KEY);
  });
}
