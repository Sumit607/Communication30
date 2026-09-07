export function recordingDestination(_takeId: string): string {
  throw new Error('Video recording requires the Android app.');
}
export function ensureRecordingSpace(_durationS: number): void {
  throw new Error('Video recording requires the Android app.');
}
export async function persistRecording(
  _sourceUri: string,
  _takeId: string,
): Promise<{ filePath: string; bytes: number }> {
  throw new Error('Video recording requires the Android app.');
}
