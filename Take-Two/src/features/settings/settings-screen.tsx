import { useState } from 'react';
import { Platform } from 'react-native';
import { Body, Button, Field, Heading, Notice } from '@/components/ui/controls';
import { Screen } from '@/components/ui/screen';
import { useDatabase } from '@/db/use-database';
import {
  configureAi,
  loadSettings,
  testAiAccess,
  clearCredential,
} from '@/services/settings-service';
import { acknowledgeFreeTier } from '@/services/coaching-service';
import { DEFAULT_MODEL } from '@/services/gemini/client';
export default function SettingsScreen() {
  const { db, refresh } = useDatabase();
  const settings = loadSettings(db);
  const [key, setKey] = useState(''),
    [model, setModel] = useState(settings?.geminiModel ?? DEFAULT_MODEL),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(''),
    [error, setError] = useState('');
  async function run(action: () => Promise<void>, success: string) {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await action();
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
        audio and selected measurements to the configured AI provider. Provider processing and
        retention follow its current API terms and your project settings.
      </Body>
      <Body muted>
        You selected Gemini's free tier. Before an AI request, Google will show its free-tier data
        terms: submitted content may be used to improve products and may be reviewed by people.
        Do not send sensitive, confidential or personal content. Take Two sends only the selected
        text or extracted audio; video and diary entries stay local.
      </Body>
      {settings?.privacyAcknowledgedAt ? (
        <Body>Free-tier data policy acknowledged on this phone.</Body>
      ) : (
        <Button
          label="I understand the free-tier data policy"
          onPress={() => { acknowledgeFreeTier(db); refresh(); }}
        />
      )}
      {Platform.OS === 'web' ? (
        <Body>API key entry is available only in the Android app’s secure storage.</Body>
      ) : (
        <Field
          label="Gemini API key"
          compact
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          value={key}
          onChangeText={setKey}
          placeholder="Stored securely on this phone"
        />
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
        label="Check model access"
        secondary
        disabled={busy || Platform.OS === 'web'}
        onPress={() =>
          run(() => testAiAccess(db), 'Model access confirmed. No personal content was sent.')
        }
      />
      <Button
        label="Remove saved key"
        secondary
        disabled={busy || Platform.OS === 'web'}
        onPress={() => run(clearCredential, 'Saved key removed.')}
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
