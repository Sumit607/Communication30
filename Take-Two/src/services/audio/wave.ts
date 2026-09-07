export type WaveInfo = { durationS: number; sampleRate: number; channels: number; bytes: number };
export function inspectPcmWave(bytes: Uint8Array): WaveInfo {
  if (bytes.byteLength < 44 || bytes.byteLength > 10 * 1024 * 1024)
    throw new Error('Choose a PCM WAV file between 44 bytes and 10 MB.');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const text = (offset: number, length: number) =>
    String.fromCharCode(...bytes.subarray(offset, offset + length));
  if (
    text(0, 4) !== 'RIFF' ||
    text(8, 4) !== 'WAVE' ||
    view.getUint32(4, true) + 8 !== bytes.length
  )
    throw new Error('This is not a complete WAV audio container.');
  let format: { channels: number; sampleRate: number; byteRate: number; align: number } | null =
      null,
    dataLength = 0,
    offset = 12,
    dataChunks = 0;
  while (offset + 8 <= bytes.length) {
    const kind = text(offset, 4),
      size = view.getUint32(offset + 4, true),
      start = offset + 8,
      end = start + size;
    if (end > bytes.length) throw new Error('The WAV file is truncated.');
    if (kind === 'fmt ') {
      if (
        format ||
        size < 16 ||
        view.getUint16(start, true) !== 1 ||
        view.getUint16(start + 14, true) !== 16
      )
        throw new Error('Only 16-bit PCM audio is accepted for this validation tool.');
      const channels = view.getUint16(start + 2, true),
        sampleRate = view.getUint32(start + 4, true),
        byteRate = view.getUint32(start + 8, true),
        align = view.getUint16(start + 12, true);
      if (
        channels < 1 ||
        channels > 2 ||
        sampleRate < 8000 ||
        sampleRate > 48000 ||
        align !== channels * 2 ||
        byteRate !== sampleRate * align
      )
        throw new Error('Unsupported WAV audio format.');
      format = { channels, sampleRate, byteRate, align };
    } else if (kind === 'data') {
      dataLength = size;
      dataChunks++;
    } else if (!['JUNK', 'LIST', 'fact', 'bext'].includes(kind))
      throw new Error('Unexpected media chunk in the audio file.');
    offset = end + (size % 2);
  }
  if (
    !format ||
    dataChunks !== 1 ||
    dataLength === 0 ||
    dataLength % format.align !== 0 ||
    offset !== bytes.length
  )
    throw new Error('A single complete PCM audio track is required.');
  const durationS = dataLength / format.byteRate;
  if (durationS < 1 || durationS > 600)
    throw new Error('Choose audio from one second to ten minutes.');
  return {
    durationS,
    sampleRate: format.sampleRate,
    channels: format.channels,
    bytes: bytes.length,
  };
}
