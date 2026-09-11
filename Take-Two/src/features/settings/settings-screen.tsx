import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { Body, Button, Field, Heading, Notice } from '@/components/ui/controls';
import { Screen } from '@/components/ui/screen';
import { useDatabase } from '@/db/use-database';
import {
  configureAi,
  loadSettings,
  testAiAccess,
  clearCredential,
  hasSavedCredential,
  resolveModel,
} from '@/services/settings-service';
import { acknowledgeFreeTier } from '@/services/coaching-service';
export default function SettingsScreen() {
  const { db, refresh } = useDatabase();
  const settings = loadSettings(db);
  const [key, setKey] = useState(''),
    [model, setModel] = useState(resolveModel(settings?.geminiModel)),
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
      setKey('');
      setMessage(success);
    } catch {
      setError(
        'This action could not finish. Check the key, model access and network, then try again.',
      );
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
        <Body>API key entry is available only in the Android app’s secure storage.</Body>
      ) : (
        <>
          {hasKey && <Body>Gemini key is configured. No need to paste it again.</Body>}
          <Field
            label={hasKey ? 'Replace key (optional)' : 'Gemini API key'}
            compact
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            value={key}
            onChangeText={setKey}
            placeholder="Stored securely on this phone"
          />
        </>
      )}
      <Field
        label="Gemini model ID"
        compact
        autoCapitalize="none"
        autoCorrect={false}
        value={model}
        onChangeText={setModel}
        placeholder="Exact model to validate"
      />
      <Button
        label="Save AI configuration"
        busy={busy}
        disabled={Platform.OS === 'web' || !model.trim()}
        onPress={() => run(() => configureAi(db, key, model), 'Configuration saved securely.')}
      />
      <Button
        label="Test Gemini connection"
        secondary
        disabled={busy || Platform.OS === 'web'}
        onPress={() =>
          run(
            () => testAiAccess(db),
            'Gemini replied OK. A small text request succeeded; no recording was sent.',
          )
        }
      />
      <Button
        label="Disable saved key"
        secondary
        disabled={busy || Platform.OS === 'web'}
        onPress={() =>
          run(clearCredential, 'Key disabled on this phone. Paste a key to enable Gemini again.')
        }
      />
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
