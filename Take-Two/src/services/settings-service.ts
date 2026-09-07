import { eq } from 'drizzle-orm';
import type { AppDatabase } from '@/db/client';
import { settings } from '@/db/schema';
import { checkModelAccess } from './gemini/client';
import { getCredential, saveCredential, clearCredential } from './security/credentials';
export { clearCredential };
export function loadSettings(db: AppDatabase) {
  return db.select().from(settings).where(eq(settings.id, 1)).get();
}
export async function configureAi(db: AppDatabase, key: string, model: string) {
  if (!/^gemini-[a-zA-Z0-9._-]+$/.test(model))
    throw new Error('Enter the exact model ID you will validate.');
  if (key.trim()) await saveCredential(key);
  if (!(await getCredential())) throw new Error('Save an API key on the Android app first.');
  db.insert(settings)
    .values({ id: 1, geminiModel: model })
    .onConflictDoUpdate({ target: settings.id, set: { geminiModel: model } })
    .run();
}
export async function testAiAccess(db: AppDatabase) {
  const key = await getCredential(),
    model = loadSettings(db)?.geminiModel;
  if (!key || !model) throw new Error('Save your model and API key first.');
  await checkModelAccess(key, model);
}
