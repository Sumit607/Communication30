import { Stack } from 'expo-router';

import { DatabaseProvider } from '@/db/database-provider';
import { RepositoryProvider } from '@/db/use-database';

export default function RootLayout() {
  return (
    <DatabaseProvider>
      <RepositoryProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </RepositoryProvider>
    </DatabaseProvider>
  );
}
