import { router } from 'expo-router';
import { Body, Button } from './controls';
export function AiDisclosure({ writing = false }: { writing?: boolean }) {
  return <>
    <Body muted>{writing ? 'Only this submitted writing and its topic will be sent.' : 'Only extracted audio and the task context will be sent. Video stays on this phone.'} Gemini free-tier content may be used to improve Google products and reviewed by people. Avoid personal, sensitive or confidential content.</Body>
    <Button label="AI settings & data policy" secondary onPress={() => router.push('/settings')} />
  </>;
}
