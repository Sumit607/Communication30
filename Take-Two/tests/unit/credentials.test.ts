import * as SecureStore from 'expo-secure-store';
import { clearCredential, getCredential, saveCredential } from '@/services/security/credentials';

jest.mock('expo-secure-store', () => ({
  isAvailableAsync: jest.fn(),
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));
jest.mock('@/services/security/personal-build-key', () => ({
  personalBuildKey: 'synthetic-personal-build-credential',
}));

const storage = new Map<string, string>();
beforeEach(() => {
  storage.clear();
  jest.mocked(SecureStore.isAvailableAsync).mockResolvedValue(true);
  jest.mocked(SecureStore.getItemAsync).mockImplementation(async (key) => storage.get(key) ?? null);
  jest.mocked(SecureStore.setItemAsync).mockImplementation(async (key, value) => {
    storage.set(key, value);
  });
  jest.mocked(SecureStore.deleteItemAsync).mockImplementation(async (key) => {
    storage.delete(key);
  });
});

test('personal builds configure once and reuse secure storage', async () => {
  expect(await getCredential()).toBe('synthetic-personal-build-credential');
  expect(await getCredential()).toBe('synthetic-personal-build-credential');
  expect(SecureStore.setItemAsync).toHaveBeenCalledTimes(1);
});

test('a saved replacement takes precedence over the bundled key', async () => {
  await saveCredential('synthetic-user-replacement-credential');
  expect(await getCredential()).toBe('synthetic-user-replacement-credential');
});

test('disabling persists and never silently restores the bundled credential', async () => {
  await getCredential();
  await clearCredential();
  expect(await getCredential()).toBeNull();
  expect(storage.has('take-two.gemini-key')).toBe(false);
  await saveCredential('synthetic-user-replacement-credential');
  expect(await getCredential()).toBe('synthetic-user-replacement-credential');
});

test('concurrent setup and disable leave the key disabled', async () => {
  await Promise.all([getCredential(), clearCredential()]);
  expect(await getCredential()).toBeNull();
});

test('web cannot retrieve the personal credential', async () => {
  jest.mocked(SecureStore.isAvailableAsync).mockResolvedValue(false);
  expect(await getCredential()).toBeNull();
  expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
});
