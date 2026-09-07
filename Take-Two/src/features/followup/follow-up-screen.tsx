import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Body, Button, Heading, Notice } from '@/components/ui/controls';
import { Screen } from '@/components/ui/screen';
import { Rating } from '@/components/ui/rating';
import { FeedbackCard } from '@/components/cards/feedback-card';
import { Playback } from '@/components/recording/playback';
import { AiDisclosure } from '@/components/ui/ai-disclosure';
import { useDatabase } from '@/db/use-database';
import { revealFollowup, revealedFollowup } from '@/db/repositories/coaching';
import { getFollowupAttempt, saveSelfCheck } from '@/db/repositories/live-response';
import { analyseFollowup } from '@/services/coaching-service';
import { useAction } from '@/hooks/use-action';

export default function FollowUpScreen() {
  const { dayId } = useLocalSearchParams<{ dayId: string }>();
  const { db, refresh } = useDatabase(), action = useAction(refresh);
  const question = revealedFollowup(db, dayId), attempt = getFollowupAttempt(db, dayId);
  const [now, setNow] = useState(Date.now()), [self, setSelf] = useState<'yes' | 'partly' | 'no' | null>(attempt?.selfAnswered ?? null), [confidence, setConfidence] = useState<number | null>(null);
  const remaining = question?.revealedAt ? Math.max(0, Math.ceil((question.revealedAt.getTime() + 10000 - now) / 1000)) : 10;
  useEffect(() => { if (!question?.revealedAt || remaining === 0) return; const timer = setInterval(() => setNow(Date.now()), 250); return () => clearInterval(timer); }, [question?.revealedAt, remaining]);
  return <Screen title="The unexpected question" footer={<Button busy={action.busy} disabled={!!question?.revealedAt && !attempt && remaining > 0} label={!question?.revealedAt ? 'Reveal my question' : !attempt ? remaining ? 'Think · ' + remaining + 's' : 'Answer in Studio' : !attempt.selfAnswered ? 'Save my self-check' : attempt.analysisState !== 'complete' ? 'Analyse my answer audio' : 'Continue to writing'} onPress={() => action.run(async signal => {
    if (!question?.revealedAt) { revealFollowup(db, dayId); setNow(Date.now()); }
    else if (!attempt) router.push({ pathname: '/day/[dayId]/studio', params: { dayId, mode: 'live' } });
    else if (!attempt.selfAnswered) { if (!self || confidence === null) throw new Error('Complete both self-ratings first.'); saveSelfCheck(db, dayId, self, confidence); }
    else if (attempt.analysisState !== 'complete') await analyseFollowup(db, dayId, signal);
    else router.push({ pathname: '/day/[dayId]/desk', params: { dayId } });
  })} />}>
    {question?.revealedAt ? <><Heading>{question.question}</Heading><Body muted>Ten seconds to think. Up to one minute to answer. Your question disappears while recording.</Body></> : <><Heading>Ready to think on your feet?</Heading><Body>Your question comes from your first take. Save Take 2 before revealing it.</Body></>}
    {attempt?.take.state === 'saved' && <>
      {!attempt.selfAnswered && <><Heading>Did I answer the actual question?</Heading>{(['yes', 'partly', 'no'] as const).map(value => <Button key={value} label={(self === value ? 'Selected · ' : '') + value} secondary onPress={() => setSelf(value)} />)}<Rating label="Confidence after Live Q (1 low, 5 high)" value={confidence} onChange={setConfidence} /></>}
      {attempt.take.filePath && <Playback uri={attempt.take.filePath} />}
      {attempt.analysisState === 'complete' ? <><FeedbackCard title="Structure"><Body>{attempt.structureVerdict}</Body></FeedbackCard><FeedbackCard title="Clarity"><Body>{attempt.clarityVerdict}</Body></FeedbackCard><FeedbackCard title="One thing for next time"><Body>{attempt.nextImprovement}</Body></FeedbackCard></> : <AiDisclosure />}
    </>}
    {attempt && attempt.take.state !== 'saved' && <Notice>This Live Q recording did not finish. The attempt is retained for recovery; it is not marked complete.</Notice>}
    {action.error && <Notice>{action.error}</Notice>}
  </Screen>;
}
