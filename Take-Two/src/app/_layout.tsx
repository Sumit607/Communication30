import { Stack } from 'expo-router';

import { DatabaseProvider } from '@/db/database-provider';

export default function RootLayout() {
  return (
    <DatabaseProvider>
      <Stack screenOptions={{ title: 'Take Two' }} />
    </DatabaseProvider>
  );
}
