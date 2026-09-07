import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Body, Button, Field, Heading, Notice } from '@/components/ui/controls';
import { Screen } from '@/components/ui/screen';
import { Rating } from '@/components/ui/rating';
import { useDatabase } from '@/db/use-database';
import { loadDiary, saveDiary, type DiaryDraft } from '@/db/repositories/diary';
export default function DiaryScreen() {
  const { dayId } = useLocalSearchParams<{ dayId: string }>();
  const { db } = useDatabase();
  const saved = loadDiary(db, dayId);
  const [draft, setDraft] = useState<DiaryDraft>(
      saved ?? { did: '', learned: '', tomorrow: '', mood: null },
    ),
    [error, setError] = useState('');
  return (
    <Screen
      title="Reflect"
      footer={
        <Button
          label="Save reflection"
          onPress={() => {
            try {
              saveDiary(db, dayId, draft);
              router.back();
            } catch (e) {
              setError((e as Error).message);
            }
          }}
        />
      }
    >
      <Heading>A moment for yourself.</Heading>
      <Body muted>No score. No AI. Nothing to prove.</Body>
      {(['did', 'learned', 'tomorrow'] as const).map((key, i) => (
        <Field
          key={key}
          label={['What did I do?', 'What did I learn?', 'What will I try tomorrow?'][i]}
          value={draft[key]}
          onChangeText={(value) => setDraft((current) => ({ ...current, [key]: value }))}
          maxLength={5000}
        />
      ))}
      <Rating
        label="How do I feel? (1 low, 5 high)"
        value={draft.mood}
        onChange={(mood) => setDraft((current) => ({ ...current, mood }))}
      />
      <Button label="Skip reflection" secondary onPress={() => router.back()} />
      <Body muted>Reflection is optional and never affects your streak.</Body>
      {error && <Notice>{error}</Notice>}
    </Screen>
  );
}
