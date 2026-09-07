import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Body, Button, Heading, Notice } from '@/components/ui/controls';
import { Screen } from '@/components/ui/screen';
import { FeedbackCard } from '@/components/cards/feedback-card';
import { Playback } from '@/components/recording/playback';
import { AiDisclosure } from '@/components/ui/ai-disclosure';
import { useDatabase } from '@/db/use-database';
import { dayTakes } from '@/db/repositories/recording';
import { originalCoach, reviewCoach } from '@/db/repositories/coaching';
import { analyseTake } from '@/services/coaching-service';
import { useAction } from '@/hooks/use-action';

export default function CoachScreen() {
  const { dayId } = useLocalSearchParams<{ dayId: string }>();
  const { db, refresh } = useDatabase(), action = useAction(refresh);
  const saved = dayTakes(db, dayId).filter(take => take.state === 'saved'), first = saved[0], coach = originalCoach(db, dayId);
  const [details, setDetails] = useState(false), [play, setPlay] = useState(false);
  return <Screen title="Coach · Take 1" footer={first && <Button busy={action.busy} label={coach ? saved.length > 1 ? 'Compare my takes' : 'Try these in Take 2' : 'Analyse Take 1 audio'} onPress={() => action.run(async signal => {
    if (!coach) await analyseTake(db, dayId, first.id, signal);
    else { reviewCoach(db, dayId); refresh(); router.push({ pathname: saved.length > 1 ? '/day/[dayId]/compare' : '/day/[dayId]/studio', params: { dayId } }); }
  })} />}>
    {!first ? <><Heading>Your first take comes first.</Heading><Button label="Open Studio" onPress={() => router.replace({ pathname: '/day/[dayId]/studio', params: { dayId } })} /></> : <>
      {coach ? <>
        <Heading>A clearer point. A calmer delivery.</Heading>
        <FeedbackCard title="One strength to keep" strength><Body>{coach.result.strength}</Body></FeedbackCard>
        {coach.result.corrections.map((fix, index) => <FeedbackCard key={fix.id} title={'0' + (index + 1) + ' · ' + fix.issue}><Body>{fix.fix}</Body><Body muted>{Math.floor(fix.at_s)}s · “{fix.quote}”</Body></FeedbackCard>)}
        {coach.result.corrections.length === 0 && <Body>No priority correction was warranted. Take 2 still gives you another chance to communicate naturally.</Body>}
        <Button label={details ? 'Hide full feedback' : 'Scores, transcript & extra detail'} secondary onPress={() => setDetails(!details)} />
        {details && <>
          <Body muted>AI estimates · vocal presence is separate from your self-rated confidence.</Body>
          {Object.entries(coach.result.scores).map(([name, score]) => <Body key={name}>{name.replaceAll('_', ' ')} · {score}/10</Body>)}
          {coach.result.say_this_instead && <FeedbackCard title="Say this instead"><Body>“{coach.result.say_this_instead.you_said}”</Body><Body>{coach.result.say_this_instead.instead}</Body></FeedbackCard>}
          {coach.result.word_for_today && <FeedbackCard title={coach.result.word_for_today.word}><Body>{coach.result.word_for_today.meaning}</Body><Body>{coach.result.word_for_today.use_it_here}</Body></FeedbackCard>}
          {coach.result.angle_you_missed && <FeedbackCard title="An angle to consider"><Body>{coach.result.angle_you_missed}</Body></FeedbackCard>}
          <Heading>Transcript</Heading><Body>{coach.result.transcript}</Body>
        </>}
      </> : <><Heading>Find your next improvement.</Heading><Body>One strength. Up to three practical corrections. No video upload.</Body><AiDisclosure /></>}
      <Button secondary label={play ? 'Close local playback' : 'Play my first recording'} onPress={() => setPlay(!play)} />
      {play && first.filePath && <Playback uri={first.filePath} />}
    </>}
    {action.busy && <Body>Analysing audio… Your recording is safely saved.</Body>}
    {action.error && <Notice>{action.error}</Notice>}
  </Screen>;
}
