import { router, useLocalSearchParams } from 'expo-router';
import { useDatabase } from '@/db/use-database';
import { loadPrep, saveThinking } from '@/db/repositories/prep';
import { Screen } from '@/components/ui/screen';
import { Body, Button, Heading } from '@/components/ui/controls';
import { ThinkForm, thinkingFields } from './think-form';
export default function PrepScreen() {
  const { dayId } = useLocalSearchParams<{ dayId: string }>();
  const { db, refresh } = useDatabase();
  const prep = loadPrep(db, dayId);
  if (!prep.input?.completedAt)
    return (
      <Screen title="Think">
        <Body>Start with today’s input.</Body>
        <Button
          label="Open input"
          onPress={() => router.replace({ pathname: '/day/[dayId]/input', params: { dayId } })}
        />
      </Screen>
    );
  if (prep.thinking?.submittedAt)
    return (
      <Screen
        title="Your thinking"
        detail={'Day ' + prep.day.dayNo}
        footer={
          <Button
            label="Build my outline"
            onPress={() => router.push({ pathname: '/day/[dayId]/outline', params: { dayId } })}
          />
        }
      >
        <Heading>{prep.day.brief}</Heading>
        {thinkingFields.map(([key, label]) => (
          <Body key={key}>
            {label}
            {'\n'}
            {prep.thinking?.[key]}
          </Body>
        ))}
        <Body muted>
          Your original thinking is saved. Coach comparison will become available after Coach
          validation.
        </Body>
      </Screen>
    );
  return (
    <ThinkForm
      dayNo={prep.day.dayNo}
      topic={prep.day.brief}
      initial={prep.thinking}
      onSave={(draft) => saveThinking(db, dayId, draft)}
      onSubmit={async (draft) => {
        saveThinking(db, dayId, draft, true);
        refresh();
      }}
    />
  );
}
