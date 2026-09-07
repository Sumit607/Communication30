import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Body, Button, Field, Heading, Notice } from '@/components/ui/controls';
import { Screen } from '@/components/ui/screen';
import { useDatabase } from '@/db/use-database';
import { loadPrep, saveOutline } from '@/db/repositories/prep';
import { outlineLabels } from '@/features/programme/curriculum';
export default function OutlineScreen() {
  const { dayId } = useLocalSearchParams<{ dayId: string }>();
  const { db, refresh } = useDatabase();
  const prep = loadPrep(db, dayId);
  const [lines, setLines] = useState(
      prep.outline
        ? [prep.outline.line1, prep.outline.line2, prep.outline.line3, prep.outline.line4]
        : ['', '', '', ''],
    ),
    [error, setError] = useState('');
  if (!prep.thinking?.submittedAt)
    return (
      <Screen title="Outline">
        <Body>Submit your thinking before building an outline.</Body>
        <Button
          label="Open Think"
          onPress={() => router.replace({ pathname: '/day/[dayId]/prep', params: { dayId } })}
        />
      </Screen>
    );
  return (
    <Screen
      title="Outline"
      detail={'Day ' + prep.day.dayNo}
      footer={
        <Button
          label="Go to Studio"
          disabled={lines.some((line) => !line.trim() || line.trim().split(/\s+/).length > 8)}
          onPress={() => {
            try {
              saveOutline(db, dayId, lines);
              refresh();
              router.push({ pathname: '/day/[dayId]/studio', params: { dayId } });
            } catch (e) {
              setError((e as Error).message);
            }
          }}
        />
      }
    >
      <Heading>A shape, not a script.</Heading>
      <Body muted>
        Four lines. Aim for six to eight words each. Your outline disappears when recording begins.
      </Body>
      {outlineLabels(prep.day.structureExpected ?? '').map((label, i) => (
        <Field
          key={label}
          label={label}
          hint={(lines[i].trim() ? lines[i].trim().split(/\s+/).length : 0) + ' / 8 words'}
          value={lines[i]}
          compact
          onChangeText={(value) =>
            setLines((current) => current.map((line, n) => (n === i ? value : line)))
          }
        />
      ))}
      {error && <Notice>{error}</Notice>}
    </Screen>
  );
}
