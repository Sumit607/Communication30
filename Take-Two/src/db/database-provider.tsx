import { SQLiteProvider } from 'expo-sqlite';
import { Component, Suspense, type PropsWithChildren } from 'react';
import { Platform, Text, View } from 'react-native';

import { DATABASE_NAME } from './client';
import { initializeDatabase } from './initialize';

class DatabaseErrorBoundary extends Component<PropsWithChildren, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
          <Text accessibilityRole="alert">
            Take Two could not open local storage. Close and reopen the app. Your data has not been
            reset.
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export function DatabaseProvider({ children }: PropsWithChildren) {
  return (
    <DatabaseErrorBoundary>
      <Suspense fallback={<Text>Opening local storage…</Text>}>
        <SQLiteProvider
          databaseName={Platform.OS === 'web' ? ':memory:' : DATABASE_NAME}
          onInit={initializeDatabase}
          useSuspense
        >
          {children}
        </SQLiteProvider>
      </Suspense>
    </DatabaseErrorBoundary>
  );
}
