import { router, useLocalSearchParams } from 'expo-router';
import { eq } from 'drizzle-orm';
import { useState } from 'react';
import { Body, Button, Heading, Notice } from '@/components/ui/controls';
import { Screen } from '@/components/ui/screen';
import { Rating } from '@/components/ui/rating';
import { FeedbackCard } from '@/components/cards/feedback-card';
import { Playback } from '@/components/recording/playback';
import { AiDisclosure } from '@/components/ui/ai-disclosure';
import { useDatabase } from '@/db/use-database';
import { confidenceRatings } from '@/db/schema';
import { dayTakes } from '@/db/repositories/recording';
import { comparison, originalCoach } from '@/db/repositories/coaching';
import { saveAfterConfidence } from '@/db/repositories/live-response';
import { analyseTake } from '@/services/coaching-service';
import { useAction } from '@/hooks/use-action';

export default function CompareScreen() {
  const { dayId } = useLocalSearchParams<{ dayId: string }>();
  const { db, refresh } = useDatabase(), action = useAction(refresh);
  const takes = dayTakes(db, dayId), saved = takes.filter(take => take.state === 'saved'), original = originalCoach(db, dayId), deltas = comparison(db, dayId);
  const confidence = db.select().from(confidenceRatings).where(eq(confidenceRatings.taskId, dayId + '-core')).get();
  const [rating, setRating] = useState<number | null>(confidence?.afterConfidence ?? null), [play, setPlay] = useState<string | null>(null);
  const latest = deltas[deltas.length - 1];
  return <Screen title="Compare my takes" footer={latest && <Button busy={action.busy} disabled={rating === null} label={!confidence?.afterConfidence ? 'Save my confidence' : !latest.result ? 'Analyse my reshoot audio' : 'Open the surprise question'} onPress={() => action.run(async signal => {
    if (!confidence?.afterConfidence) saveAfterConfidence(db, dayId, rating!);
    else if (!latest.result) await analyseTake(db, dayId, latest.take.id, signal);
    else router.push({ pathname: '/day/[dayId]/follow-up', params: { dayId } });
  })} />}>
    <Heading>Same idea. Notice what changed.</Heading>
    {!latest ? <><Body>Record Take 2 before comparing your delivery.</Body><Button label="Review Take 1" onPress={() => router.replace({ pathname: '/day/[dayId]/coach', params: { dayId } })} /></> : <>
      {!confidence?.afterConfidence && <Rating label="Confidence after Take 2 (1 low, 5 high)" value={rating} onChange={setRating} />}
      {saved.map((take, index) => <Button key={take.id} label={'Play Take ' + (index + 1) + ' · attempt ' + take.takeNo} secondary onPress={() => setPlay(take.filePath)} />)}
      {play && <Playback key={play} uri={play} />}
      {deltas.map(({ take, result }, index) => <FeedbackCard key={take.id} title={'Take 1 → Take ' + (index + 2)}>
        {result ? <><Body>{result.summary}</Body>{result.corrections.map((fix, i) => <FeedbackCard key={fix.correction_id} title={fix.verdict}><Body>{original?.result.corrections[i].fix}</Body><Body muted>{fix.evidence}</Body></FeedbackCard>)}<Body muted>Transcript</Body><Body>{result.transcript}</Body></> : <Body>Ready to check the original corrections against this recording.</Body>}
      </FeedbackCard>)}
      {!latest.result && <AiDisclosure />}
      {confidence?.afterConfidence && !latest.result && <Button label="Continue to Live Q; compare later" secondary onPress={() => router.push({ pathname: '/day/[dayId]/follow-up', params: { dayId } })} />}
      {latest.result && takes.length < 3 && <Button label="One optional final take" secondary onPress={() => router.push({ pathname: '/day/[dayId]/studio', params: { dayId } })} />}
      {takes.length >= 3 && <Body muted>All three attempts are used. Keep what you learned for tomorrow.</Body>}
    </>}
    {action.error && <Notice>{action.error}</Notice>}
  </Screen>;
}
