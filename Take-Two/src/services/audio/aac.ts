const rates = [96000, 88200, 64000, 48000, 44100, 32000, 24000, 22050, 16000, 12000, 11025, 8000, 7350];
export type VerifiedAudio = { base64: string; mimeType: 'audio/aac'; durationS: number; bytes: number };
/** Parse every ADTS frame. A file extension or native MIME claim alone is insufficient. */
export function inspectAac(base64: string): VerifiedAudio {
  if (!base64 || base64.length > 14 * 1024 * 1024) throw new Error('Audio exceeds the upload limit.');
  const raw = atob(base64);
  let offset = 0, frames = 0, sampleRate = 0, channelCount = 0;
  while (offset < raw.length) {
    const b = (index: number) => raw.charCodeAt(offset + index);
    if (offset + 7 > raw.length || b(0) !== 255 || (b(1) & 0xfe) !== 0xf0 || (b(2) >> 6) !== 1)
      throw new Error('Only verified AAC-LC audio can be sent.');
    const rate = rates[(b(2) >> 2) & 15], channels = ((b(2) & 1) << 2) | (b(3) >> 6);
    const size = ((b(3) & 3) << 11) | (b(4) << 3) | (b(5) >> 5);
    const header = (b(1) & 1) ? 7 : 9;
    if (!rate || channels < 1 || channels > 2 || (b(6) & 3) !== 0 || size <= header || offset + size > raw.length)
      throw new Error('Audio frame validation failed.');
    if (frames && (rate !== sampleRate || channels !== channelCount)) throw new Error('Audio format changed during capture.');
    sampleRate = rate; channelCount = channels; frames++; offset += size;
  }
  const durationS = frames * 1024 / sampleRate;
  if (!frames || durationS > 605 || raw.length > 10 * 1024 * 1024) throw new Error('Audio is empty or too long.');
  return { base64, mimeType: 'audio/aac', durationS, bytes: raw.length };
}
