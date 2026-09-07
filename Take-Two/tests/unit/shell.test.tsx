import { render, screen } from '@testing-library/react-native';

import type { PropsWithChildren } from 'react';
import RootLayout from '@/app/_layout';
jest.mock('expo-router', () => {
  const Text = jest.requireActual('react-native').Text;
  return { Stack: () => <Text>Route content</Text> };
});
jest.mock('@/db/use-database', () => ({
  RepositoryProvider: ({ children }: PropsWithChildren) => children,
}));
let mockStorageFailure = false;
jest.mock('expo-sqlite', () => ({
  SQLiteProvider: ({ children }: PropsWithChildren) => {
    if (mockStorageFailure) throw new Error('Synthetic storage failure');
    return children;
  },
}));
afterEach(() => {
  mockStorageFailure = false;
  jest.restoreAllMocks();
});
test('root renders routes only after storage initialization', async () => {
  await render(<RootLayout />);
  expect(screen.getByText('Route content')).toBeOnTheScreen();
});
test('storage failure hides routes and preserves the recovery message', async () => {
  mockStorageFailure = true;
  jest.spyOn(console, 'error').mockImplementation(() => {});
  await render(<RootLayout />);
  expect(screen.getByRole('alert')).toHaveTextContent(/Your data has not been reset/);
  expect(screen.queryByText('Route content')).toBeNull();
  expect(screen.queryByText('Synthetic storage failure')).toBeNull();
});
