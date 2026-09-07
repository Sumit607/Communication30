import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Body, Button, Field, Heading, Notice } from '@/components/ui/controls';
import { Screen } from '@/components/ui/screen';
import { useDatabase } from '@/db/use-database';
import { loadDay } from '@/db/repositories/programme';
import { loadWriting, saveWriting } from '@/db/repositories/writing';
export default function DeskScreen() {
  const { dayId } = useLocalSearchParams<{ dayId: string }>();
  const { db, refresh } = useDatabase();
  const day = loadDay(db, dayId),
    saved = loadWriting(db, dayId);
  const [body, setBody] = useState(saved?.body ?? ''),
    [error, setError] = useState(''),
    [message, setMessage] = useState('');
  function save(submit = false) {
    try {
      saveWriting(db, dayId, body, submit);
      refresh();
      setMessage(submit ? 'Your original writing is saved.' : 'Draft saved on this device.');
      setError('');
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <Screen
      title="Writing desk"
      detail={'Day ' + day.dayNo}
      footer={
        <Button
          label={saved?.submittedAt ? 'Continue to reflection' : 'Save my writing'}
          disabled={!body.trim()}
          onPress={() =>
            saved?.submittedAt
              ? router.push({ pathname: '/day/[dayId]/diary', params: { dayId } })
              : save(true)
          }
        />
      }
    >
      <Heading>{day.policy.essay || 'Say it in three sentences.'}</Heading>
      <Body muted>
        {day.writingMode === 'long'
          ? 'About 250 words. Put your position in the first two sentences.'
          : 'My position. My strongest reason. My conclusion or implication.'}
      </Body>
      <Field
        label="My writing"
        multiline
        value={body}
        editable={!saved?.submittedAt}
        onChangeText={(value) => {
          setBody(value);
          setMessage('');
        }}
        maxLength={20000}
        style={{ minHeight: 320 }}
      />
      <Body muted>{body.trim() ? body.trim().split(/\s+/).length : 0} words</Body>
      {!saved?.submittedAt && <Button label="Save draft" secondary onPress={() => save()} />}
      {message && <Body>{message}</Body>}
      {error && <Notice>{error}</Notice>}
      <Body muted>
        Writing feedback is not active until Coach validation. Your draft remains local.
      </Body>
    </Screen>
  );
}
