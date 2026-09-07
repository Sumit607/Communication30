import { useState } from 'react';
import { ThinkForm } from './think-form';
import { Screen } from '@/components/ui/screen';
import { Body, Button, Heading } from '@/components/ui/controls';
export default function DesignPreviewScreen() {
  const [submitted, setSubmitted] = useState(false);
  if (submitted)
    return (
      <Screen title="Design preview">
        <Heading>Thinking submitted.</Heading>
        <Body>
          This isolated preview does not create programme progress or send anything to AI.
        </Body>
        <Button label="Reset preview" onPress={() => setSubmitted(false)} />
      </Screen>
    );
  return (
    <ThinkForm
      dayNo={3}
      topic="Is social media good or bad?"
      onSave={() => {}}
      onSubmit={async () => setSubmitted(true)}
    />
  );
}
