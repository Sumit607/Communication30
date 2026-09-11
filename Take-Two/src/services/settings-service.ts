import { eq } from 'drizzle-orm';
import type { AppDatabase } from '@/db/client';
import { settings } from '@/db/schema';
import { checkModelAccess } from './gemini/client';
import { resolveModel } from './gemini/model';
import { getCredential, saveCredential, clearCredential } from './security/credentials';
export { clearCredential };
export { resolveModel } from './gemini/model';
export async function hasSavedCredential() {
  return Boolean(await getCredential());
}
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
    model = resolveModel(loadSettings(db)?.geminiModel);
  if (!key) throw new Error('Save your API key first.');
  await checkModelAccess(key, model);
}
