import { useState } from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Field, Heading, Notice } from '@/components/ui/controls';
import { Screen } from '@/components/ui/screen';
import { theme } from '@/constants/theme';

export type ThinkingDraft = { what: string; why: string; soWhat: string; myView: string };
export const emptyThinking: ThinkingDraft = { what: '', why: '', soWhat: '', myView: '' };
export const thinkingFields = [
  ['what', 'What happened?', 'The idea or claim'],
  ['why', 'Why does it matter?', 'The cause or reasoning'],
  ['soWhat', 'What are the trade-offs?', 'People, consequences, choices'],
  ['myView', 'What do I think?', 'Your own position'],
] as const;
export function ThinkForm({
  dayNo,
  topic,
  initial = emptyThinking,
  onSave,
  onSubmit,
}: {
  dayNo: number;
  topic: string;
  initial?: ThinkingDraft;
  onSave: (draft: ThinkingDraft) => void;
  onSubmit: (draft: ThinkingDraft) => Promise<void>;
}) {
  const [draft, setDraft] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const valid = Object.values(draft).every((value) => value.trim().length > 0);
  async function submit() {
    setBusy(true);
    setError('');
    try {
      await onSubmit(draft);
    } catch {
      setError('Your thinking could not be saved. Please try again.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <Screen
      title="Think"
      detail={`Day ${dayNo}`}
      footer={
        <>
          {error && <Notice>{error}</Notice>}
          <Text style={{ textAlign: 'center', fontSize: 14, color: theme.muted }}>
            Submit first. Compare with Coach after.
          </Text>
          <Button label="Submit my thinking" disabled={!valid} busy={busy} onPress={submit} />
        </>
      }
    >
      <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center', marginBottom: 4 }}>
        <Text style={{ fontSize: 15, color: theme.muted }}>Input</Text>
        <Ionicons name="checkmark-circle" color={theme.success} size={20} />
        <Text style={{ color: theme.muted }}>/</Text>
        <Text style={{ fontSize: 15, fontWeight: '700', color: theme.accent }}>Think</Text>
        <Text style={{ color: theme.muted }}>/</Text>
        <Text style={{ fontSize: 15, color: theme.muted }}>Outline</Text>
      </View>
      <View style={{ gap: 9 }}>
        <Heading>{topic}</Heading>
        <Text style={{ color: theme.muted, fontSize: 16, lineHeight: 24 }}>
          Four thoughts. Your own words.
        </Text>
      </View>
      <View style={{ gap: 22 }}>
        {thinkingFields.map(([key, label, hint], index) => (
          <Field
            key={key}
            number={`0${index + 1}`}
            label={label}
            hint={hint}
            value={draft[key]}
            maxLength={3000}
            onChangeText={(value) => {
              const next = { ...draft, [key]: value };
              setDraft(next);
              try {
                onSave(next);
                setError('');
              } catch {
                setError('Draft could not be saved. Keep this screen open and try again.');
              }
            }}
          />
        ))}
      </View>
    </Screen>
  );
}
