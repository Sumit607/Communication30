import { useEffect, useRef, useState } from 'react';
import { AppState, BackHandler } from 'react-native';
import type { CameraView } from 'expo-camera';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import * as Haptics from 'expo-haptics';
import type { AppDatabase } from '@/db/client';
import { reserveTake, finishTake, failTake } from '@/db/repositories/recording';
import { reserveFollowup } from '@/db/repositories/live-response';
import { recordingDuration } from '@/services/audio/native';
import {
  ensureRecordingSpace,
  persistRecording,
  recordingDestination,
} from '@/services/storage/recordings';
export function useRecording(
  db: AppDatabase,
  dayId: string,
  durationS: number,
  onSaved: () => void,
  live = false,
) {
  const camera = useRef<CameraView>(null),
    active = useRef(false),
    mounted = useRef(true),
    startTime = useRef(0),
    generation = useRef(0);
  const [state, setState] = useState<'idle' | 'countdown' | 'recording' | 'saving'>('idle'),
    [count, setCount] = useState(3),
    [elapsed, setElapsed] = useState(0),
    [error, setError] = useState('');
  useEffect(() => {
    mounted.current = true;
    const back = BackHandler.addEventListener('hardwareBackPress', () => active.current);
    const sub = AppState.addEventListener('change', (next) => {
      if (next !== 'active') {
        generation.current++;
        camera.current?.stopRecording();
      }
    });
    return () => {
      mounted.current = false;
      // Read the current generation and camera: permission changes can mount a new camera after this effect.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      generation.current++;
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (active.current) camera.current?.stopRecording();
      back.remove();
      sub.remove();
      void deactivateKeepAwake('take-two-recording');
    };
  }, []);
  useEffect(() => {
    if (state !== 'recording') return;
    const timer = setInterval(
      () => setElapsed(Math.min(durationS, (Date.now() - startTime.current) / 1000)),
      250,
    );
    return () => clearInterval(timer);
  }, [state, durationS]);
  async function start() {
    if (active.current) return;
    active.current = true;
    const run = ++generation.current;
    let takeId: string | undefined;
    try {
      ensureRecordingSpace(durationS);
      setError('');
      setState('countdown');
      await activateKeepAwakeAsync('take-two-recording');
      for (let i = 3; i > 0; i--) {
        if (!mounted.current || generation.current !== run)
          throw new Error('Countdown cancelled. No attempt was used.');
        setCount(i);
        void Haptics.selectionAsync().catch(() => {});
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      if (!camera.current || generation.current !== run)
        throw new Error('Camera is not ready. No attempt was used.');
      takeId = live ? reserveFollowup(db, dayId, recordingDestination) : reserveTake(db, dayId, recordingDestination);
      startTime.current = Date.now();
      setElapsed(0);
      setState('recording');
      const result = await camera.current.recordAsync({
        maxDuration: durationS,
        maxFileSize: Math.ceil((durationS * 5000000) / 8),
      });
      if (!result?.uri)
        throw new Error('The camera did not return a recording. This attempt remains used.');
      if (mounted.current) setState('saving');
      const saved = await persistRecording(result.uri, takeId);
      const actualDuration = await recordingDuration(saved.filePath);
      finishTake(db, takeId, { ...saved, durationS: actualDuration });
      if (mounted.current) onSaved();
    } catch (e) {
      if (takeId) failTake(db, takeId);
      if (mounted.current)
        setError(e instanceof Error ? e.message : 'Recording could not be saved.');
    } finally {
      active.current = false;
      void deactivateKeepAwake('take-two-recording');
      if (mounted.current) setState('idle');
    }
  }
  return {
    camera,
    state,
    count,
    elapsed,
    error,
    start,
    stop: () => camera.current?.stopRecording(),
  };
}
