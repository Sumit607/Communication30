import { requireOptionalNativeModule } from 'expo';
import { inspectAac } from './aac';
type MediaModule = { extractAudio(uri: string): Promise<{ base64: string }>; duration(uri: string): Promise<number> };
function native() {
  const module = requireOptionalNativeModule<MediaModule>('TakeTwoNative');
  if (!module) throw new Error('Install the Take Two Android APK to process recordings.');
  return module;
}
export async function extractAudio(uri: string) { return inspectAac((await native().extractAudio(uri)).base64); }
export async function recordingDuration(uri: string) { return native().duration(uri); }
