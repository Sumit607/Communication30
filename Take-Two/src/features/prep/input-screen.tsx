import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Body, Button, Field, Heading, Notice } from '@/components/ui/controls';
import { Screen } from '@/components/ui/screen';
import { useDatabase } from '@/db/use-database';
import { completeInput, loadPrep } from '@/db/repositories/prep';
export default function InputScreen() {
  const { dayId } = useLocalSearchParams<{ dayId: string }>();
  const { db, refresh } = useDatabase();
  const prep = loadPrep(db, dayId);
  const [title, setTitle] = useState(prep.input?.title ?? ''),
    [content, setContent] = useState(prep.input?.contentSnapshot ?? ''),
    [fact, setFact] = useState(prep.input?.memoryFact ?? ''),
    [error, setError] = useState('');
  return (
    <Screen
      title="Input"
      detail={'Day ' + prep.day.dayNo}
      footer={
        <Button
          label="Start thinking"
          disabled={!content.trim() || !fact.trim()}
          onPress={() => {
            try {
              if (!prep.thinking?.submittedAt)
                completeInput(db, dayId, title || prep.day.brief, content, fact);
              refresh();
              router.push({ pathname: '/day/[dayId]/prep', params: { dayId } });
            } catch (e) {
              setError((e as Error).message);
            }
          }}
        />
      }
    >
      <Heading>One idea to work with.</Heading>
      <Body muted>
        Read one article or watch one video about today’s topic. Bring the idea here, then form your
        own view.
      </Body>
      <Body>{prep.day.brief}</Body>
      <Field
        label="Source title"
        value={title}
        onChangeText={setTitle}
        compact
        editable={!prep.thinking?.submittedAt}
      />
      <Field
        label="Article excerpt or your viewing notes"
        hint="Source feeds will be added in the content phase."
        value={content}
        onChangeText={setContent}
        style={{ minHeight: 180 }}
        maxLength={12000}
        editable={!prep.thinking?.submittedAt}
      />
      <Field
        label="One fact worth remembering"
        value={fact}
        onChangeText={setFact}
        maxLength={500}
        editable={!prep.thinking?.submittedAt}
      />
      {error && <Notice>{error}</Notice>}
    </Screen>
  );
}
