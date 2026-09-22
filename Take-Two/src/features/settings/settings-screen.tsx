import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { Body, Button, Heading, Notice } from '@/components/ui/controls';
import { Screen } from '@/components/ui/screen';
import { useDatabase } from '@/db/use-database';
import {
  loadSettings,
  testAiAccess,
  hasSavedCredential,
  resolveModel,
} from '@/services/settings-service';
import { acknowledgeFreeTier } from '@/services/coaching-service';

export default function SettingsScreen() {
  const { db, refresh } = useDatabase();
  const settings = loadSettings(db);
  const [model] = useState(resolveModel(settings?.geminiModel)),
    [hasKey, setHasKey] = useState(false),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(''),
    [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    hasSavedCredential().then(
      (saved) => {
        if (mounted) setHasKey(saved);
      },
      () => {
        if (mounted) setError('Could not access secure key storage. Reopen Settings to retry.');
      },
    );
    return () => {
      mounted = false;
    };
  }, []);

  async function run(action: () => Promise<void>, success: string) {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await action();
      setHasKey(await hasSavedCredential());
      setMessage(success);
    } catch {
      setError('This action could not finish. Check network connectivity and try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen title="Settings">
      <Heading>Your practice. Your data.</Heading>
      <Body>
        Your speaking videos stay on this phone. When you ask for feedback, Take Two sends extracted
        audio and topic context to the configured AI provider. Provider processing and retention
        follow its current API terms and your project settings.
      </Body>
      <Body muted>
        You selected Gemini’s free tier. Its data terms allow submitted content to be used to
        improve products and reviewed by people. Do not send sensitive, confidential or personal
        content. Take Two sends only the selected text or extracted audio; video and diary entries
        stay local.
      </Body>
      {settings?.privacyAcknowledgedAt ? (
        <Body>Free-tier data policy acknowledged on this phone.</Body>
      ) : (
        <Button
          label="I understand the free-tier data policy"
          onPress={() => {
            acknowledgeFreeTier(db);
            refresh();
          }}
        />
      )}
      {Platform.OS === 'web' ? (
        <Body>AI Coach operates inside the standalone Android application.</Body>
      ) : (
        <>
          <Body>
            {hasKey
              ? 'AI Coach: Pre-configured and ready on this phone.'
              : 'AI Coach: Built-in service configuration.'}
          </Body>
          <Body muted>Model: {model}</Body>
          <Button
            label="Test Gemini connection"
            secondary
            disabled={busy}
            onPress={() =>
              run(
                () => testAiAccess(db),
                'Gemini replied OK. A small text request succeeded; no recording was sent.',
              )
            }
          />
        </>
      )}
      {message && <Body>{message}</Body>}
      {error && <Notice>{error}</Notice>}
      <Body muted>
        Free-tier quota errors keep your recordings and show a retry message. The app never switches
        to a paid model automatically. Native measurements, reminders, export and release testing
        remain planned phases.
      </Body>
    </Screen>
  );
}
