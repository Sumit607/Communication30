import { render, screen } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import RootLayout from '@/app/_layout';

jest.mock('expo-router', () => ({
  Stack: jest.requireActual('@/features/programme/home-screen').default,
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

test('minimal root shell renders without starting product workflows', async () => {
  await render(<RootLayout />);
  expect(screen.getByText('Project setup complete')).toBeOnTheScreen();
  expect(screen.getByText(/Coach validation is still pending/)).toBeOnTheScreen();
});

test('storage failure hides the shell and explains recovery without revealing error details', async () => {
  mockStorageFailure = true;
  jest.spyOn(console, 'error').mockImplementation(() => {});
  await render(<RootLayout />);
  expect(screen.getByRole('alert')).toHaveTextContent(/Your data has not been reset\./);
  expect(screen.queryByText('Project setup complete')).toBeNull();
  expect(screen.queryByText('Synthetic storage failure')).toBeNull();
});
