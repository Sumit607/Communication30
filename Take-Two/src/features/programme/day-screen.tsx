import { router, useLocalSearchParams } from 'expo-router';
import { Body, Button, Heading } from '@/components/ui/controls';
import { Screen } from '@/components/ui/screen';
import { useDatabase } from '@/db/use-database';
import { loadPrep } from '@/db/repositories/prep';
export default function DayScreen() {
  const { dayId } = useLocalSearchParams<{ dayId: string }>();
  const { db } = useDatabase();
  const { day, input, thinking, outline } = loadPrep(db, dayId);
  const next = !day.policy.preparation
    ? 'studio'
    : !input?.completedAt
      ? 'input'
      : !thinking?.submittedAt
        ? 'prep'
        : !outline
          ? 'outline'
          : 'studio';
  return (
    <Screen
      title={'Day ' + day.dayNo}
      footer={
        <Button
          label={
            next === 'studio'
              ? 'Open Studio'
              : next === 'input'
                ? 'Begin with input'
                : next === 'prep'
                  ? 'Write my thoughts'
                  : 'Build my outline'
          }
          onPress={() =>
            router.push({
              pathname: ('/day/[dayId]/' + next) as '/day/[dayId]/studio',
              params: { dayId },
            })
          }
        />
      }
    >
      <Heading>{day.brief}</Heading>
      <Body muted>
        {Math.round(day.policy.durationS / 60)} minute speaking target ·{' '}
        {day.writingMode === 'long' ? 'Long writing' : 'Three-sentence compression'}
      </Body>
      {!day.policy.preparation && (
        <Body>
          This is unprepared practice. There is no outline to rehearse. Your first attempt is the
          baseline.
        </Body>
      )}
      <Body>
        Think for yourself. Record Take 1. Work on up to three corrections in Take 2. Then handle a
        question you have not seen before.
      </Body>
      <Body muted>
        Coaching quality is still being validated. Recording and saved local work do not count as a
        fully coached completion until the feedback loop is finished.
      </Body>
      <Button
        label="Open writing desk"
        secondary
        onPress={() => router.push({ pathname: '/day/[dayId]/desk', params: { dayId } })}
      />
      <Button
        label="Private reflection"
        secondary
        onPress={() => router.push({ pathname: '/day/[dayId]/diary', params: { dayId } })}
      />
    </Screen>
  );
}
