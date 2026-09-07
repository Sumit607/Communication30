import { Directory, File, Paths } from 'expo-file-system';
const reserveBytes = 100 * 1024 * 1024;
export function recordingDestination(takeId: string) {
  return new File(Paths.document, 'recordings', takeId + '.mp4').uri;
}
export function ensureRecordingSpace(durationS: number) {
  const required = Math.ceil((durationS * 5000000) / 8) + reserveBytes;
  if (Paths.availableDiskSpace < required)
    throw new Error('Not enough free space for this take. Export or delete older videos first.');
}
export async function persistRecording(sourceUri: string, takeId: string) {
  const folder = new Directory(Paths.document, 'recordings');
  if (!folder.exists) await folder.create({ intermediates: true, idempotent: true });
  const source = new File(sourceUri),
    destination = new File(folder, takeId + '.mp4');
  await source.copy(destination);
  if (!destination.exists || destination.size <= 0)
    throw new Error('The recording could not be saved. The temporary recording was retained.');
  return { filePath: destination.uri, bytes: destination.size };
}
