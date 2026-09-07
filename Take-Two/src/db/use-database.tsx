import { useSQLiteContext } from 'expo-sqlite';
import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';
import { createDatabaseClient, type AppDatabase } from './client';
const Context = createContext<{ db: AppDatabase; revision: number; refresh: () => void } | null>(
  null,
);
export function RepositoryProvider({ children }: PropsWithChildren) {
  const connection = useSQLiteContext();
  const db = useMemo(() => createDatabaseClient(connection), [connection]);
  const [revision, setRevision] = useState(0);
  return (
    <Context.Provider value={{ db, revision, refresh: () => setRevision((value) => value + 1) }}>
      {children}
    </Context.Provider>
  );
}
export function useDatabase() {
  const context = useContext(Context);
  if (!context) throw new Error('Database provider is missing.');
  return context;
}
