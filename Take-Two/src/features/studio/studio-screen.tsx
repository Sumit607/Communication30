import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Text, View } from 'react-native';
import { Body, Button, Notice } from '@/components/ui/controls';
import { Screen } from '@/components/ui/screen';
import { Rating } from '@/components/ui/rating';
import { Playback } from '@/components/recording/playback';
import { useDatabase } from '@/db/use-database';
import { loadDay } from '@/db/repositories/programme';
import { confidenceBefore, dayTakes, saveConfidenceBefore } from '@/db/repositories/recording';
import { useRecording } from './use-recording';
import { getFollowupAttempt } from '@/db/repositories/live-response';
import { originalCoach, revealedFollowup } from '@/db/repositories/coaching';
export default function StudioScreen() {
  const { dayId, mode } = useLocalSearchParams<{ dayId: string; mode?: string }>();
  const live = mode === 'live';
  const { db, refresh } = useDatabase();
  const day = loadDay(db, dayId);
  const [cameraPermission, requestCamera] = useCameraPermissions(),
    [microphonePermission, requestMicrophone] = useMicrophonePermissions();
  const [ready, setReady] = useState(false),
    [confidence, setConfidence] = useState<number | null>(confidenceBefore(db, dayId)),
    [error, setError] = useState(''),
    [playback, setPlayback] = useState<string | null>(null);
  const attempt = live ? getFollowupAttempt(db, dayId) : null;
  const question = live ? revealedFollowup(db, dayId) : null;
  const recordings = live ? (attempt ? [attempt.take] : []) : dayTakes(db, dayId),
    saved = recordings.filter((take) => take.state === 'saved');
  const durationS = live ? 60 : day.policy.durationS;
  const { camera, state, count, elapsed, error: recordingError, start, stop } = useRecording(db, dayId, durationS, () => {
    refresh();
    router.replace({ pathname: live ? '/day/[dayId]/follow-up' : saved.length ? '/day/[dayId]/compare' : '/day/[dayId]/coach', params: { dayId } });
  }, live);
  const busy = state !== 'idle', capturing = state === 'recording';
  const coach = originalCoach(db, dayId);
  if (Platform.OS === 'web')
    return (
      <Screen title="Studio">
        <Body>
          Video recording runs in the Android app. This browser preview uses the same screens, but
          does not record or upload video.
        </Body>
        <Body>
          Install the Android development build to test camera permissions, local storage and
          interruptions.
        </Body>
      </Screen>
    );
  if (!cameraPermission?.granted || !microphonePermission?.granted)
    return (
      <Screen title="Studio">
        <Body>
          Take Two needs your front camera and microphone to save a speaking take on this phone.
        </Body>
        <Button
          label="Allow camera and microphone"
          onPress={async () => {
            await requestCamera();
            await requestMicrophone();
          }}
        />
        <Body muted>If permission is blocked, enable it in Android Settings.</Body>
      </Screen>
    );
  return (
    <Screen
      title={busy ? 'Recording' : live ? 'Live Q' : 'Studio'}
      detail={busy ? undefined : recordings.length + (live ? ' / 1 attempt used' : ' / 3 attempts used')}
      dark
      back={!busy}
      footer={
        busy ? (
          <>
            <Text style={{ color: '#D7D7D7', textAlign: 'center', fontSize: 15 }}>
              {state === 'countdown'
                ? 'Get ready'
                : state === 'saving'
                  ? 'Saving on this phone…'
                  : 'Keep going. Recover and finish your thought.'}
            </Text>
            {capturing && (
              <>
                <Button
                  label="Finish take"
                  disabled={elapsed < (live ? 20 : Math.min(30, durationS))}
                  onPress={stop}
                />
                <Button
                  label="Stop early"
                  secondary dark
                  onPress={() =>
                    Alert.alert(
                      'Stop this attempt?',
                      'This attempt stays used. Any available recording will be saved.',
                      [
                        { text: 'Keep speaking', style: 'cancel' },
                        { text: 'Stop', style: 'destructive', onPress: stop },
                      ],
                    )
                  }
                />
              </>
            )}
          </>
        ) : (
          <Button
            label={live ? 'Record my answer' : saved.length ? 'Record next take' : 'Record Take 1'}
            disabled={!ready || (!live && confidence === null) || recordings.length >= (live ? 1 : 3)}
            onPress={() => {
              try {
                if (!live && !recordings.length && confidence !== null)
                  saveConfidenceBefore(db, dayId, confidence);
                void start();
              } catch (e) {
                setError((e as Error).message);
              }
            }}
          />
        )
      }
    >
      {!busy && (
        <Text style={{ color: '#F8F6F2', fontSize: 23, fontWeight: '600', lineHeight: 31 }}>
          {live ? (question?.revealedAt ? question.question : 'Reveal your question on the Live Q screen first.') : saved.length ? 'Same topic. Focus on your corrections.' : day.brief}
        </Text>
      )}
      <View style={{ height: 400, borderRadius: 10, overflow: 'hidden' }}>
        <CameraView
          ref={camera}
          style={{ flex: 1 }}
          facing="front"
          mode="video"
          videoQuality="720p"
          videoBitrate={5000000}
          onCameraReady={() => setReady(true)}
          onMountError={() => {
            setReady(false);
            setError('Camera could not start. Close other camera apps and try again.');
          }}
        />
        {state === 'countdown' && (
          <View
            style={{
              position: 'absolute',
              inset: 0,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#00000060',
            }}
          >
            <Text style={{ color: 'white', fontSize: 64 }}>{count}</Text>
          </View>
        )}
      </View>
      {capturing && (
        <View
          accessibilityRole="progressbar"
          accessibilityValue={{
            min: 0,
            max: durationS,
            now: Math.floor(elapsed),
          }}
          style={{ height: 6, backgroundColor: '#383838', borderRadius: 3 }}
        >
          <View
            style={{
              height: 6,
              width: `${(100 * elapsed) / durationS}%`,
              backgroundColor: '#C7384D',
              borderRadius: 3,
            }}
          />
        </View>
      )}
      {!busy && !live && !recordings.length && (
        <Rating
          label="Confidence before speaking (1 low, 5 high)"
          value={confidence}
          onChange={setConfidence}
        />
      )}
      {!busy &&
        saved.map((take) => (
          <Button
            key={take.id}
            label={'Play attempt ' + take.takeNo}
            secondary dark
            onPress={() => setPlayback(take.filePath)}
          />
        ))}
      {!busy && playback && <Playback uri={playback} />}
      {!busy && !live && coach && saved.length > 0 && coach.result.reshoot_brief.map(item => <Text key={item.correction_id} style={{color: '#F8F6F2', fontSize: 17, lineHeight: 25}}>{item.instruction}</Text>)}
      {!busy && !live && saved.length > 0 && (
        <Button
          label="Review Take 1"
          secondary dark
          onPress={() => router.push({ pathname: '/day/[dayId]/coach', params: { dayId } })}
        />
      )}
      {(error || recordingError) && <Notice>{error || recordingError}</Notice>}
    </Screen>
  );
}
