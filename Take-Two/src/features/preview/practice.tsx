import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { curriculum } from '@/features/programme/curriculum';
import { Action, Card, colors, Copy, Icon, Page, Row, Title } from './components';

export type PracticeStage =
  | 'day'
  | 'input'
  | 'think'
  | 'outline'
  | 'studio'
  | 'coach'
  | 'compare'
  | 'followup'
  | 'desk'
  | 'diary';
export type PracticeNavigation = {
  dayNo: number;
  onBack: () => void;
  onNext: (stage: PracticeStage) => void;
};
export function PreviewDay({ dayNo, onBack, onNext }: PracticeNavigation) {
  const day = curriculum[dayNo - 1],
    insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            backgroundColor: colors.navy,
            minHeight: 248 + insets.top,
            paddingTop: insets.top + 10,
            paddingHorizontal: 22,
            paddingBottom: 38,
          }}
        >
          <Image
            source={require('../../../assets/images/speaking-hero.png')}
            accessible={false}
            style={{ position: 'absolute', right: 0, bottom: 0, width: '100%', height: 250 }}
            resizeMode="cover"
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            onPress={onBack}
            style={{
              height: 48,
              width: 48,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 25,
              backgroundColor: '#114BCD',
            }}
          >
            <Icon name="arrow-back" color="white" />
          </Pressable>
          <Text style={{ color: '#E1E9FF', fontSize: 11, letterSpacing: 1.3, marginTop: 20 }}>
            COMMUNICATION PRACTICE
          </Text>
          <Text
            accessibilityRole="header"
            style={{ fontSize: 38, fontWeight: '700', color: 'white', marginTop: 8 }}
          >
            Day {dayNo}
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 14 }}>
            <Icon
              name={day.preparation ? 'chatbubble-outline' : 'flash-outline'}
              color="white"
              size={18}
            />
            <Text style={{ fontSize: 14, color: 'white' }}>
              {day.preparation ? 'Think. Speak. Improve.' : 'Your honest starting point'}
            </Text>
          </View>
        </View>
        <View style={{ marginTop: -20, paddingHorizontal: 14, gap: 14 }}>
          <Card>
            <View style={{ flexDirection: 'row', gap: 20 }}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={{ fontSize: 22, fontWeight: '700' }}>
                  {Math.round(day.durationS / 60)} min
                </Text>
                <Copy small muted>
                  Speaking target
                </Copy>
              </View>
              <View style={{ width: 1, backgroundColor: colors.line }} />
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={{ fontSize: 22, fontWeight: '700' }}>2 takes</Text>
                <Copy small muted>
                  One improvement
                </Copy>
              </View>
            </View>
            <View style={{ height: 1, backgroundColor: colors.line }} />
            <Text style={{ fontSize: 21, lineHeight: 28, fontWeight: '700', color: colors.ink }}>
              {day.topic}
            </Text>
            <Copy muted>
              {day.preparation
                ? 'Build your own point of view before you see any AI suggestions.'
                : 'No preparation or script. Start with what you know, in your own words.'}
            </Copy>
          </Card>
          <Card>
            <Text style={{ fontSize: 20, fontWeight: '700', color: colors.ink }}>
              Your practice
            </Text>
            {day.preparation && (
              <Row
                icon="book-outline"
                title="Input & thinking"
                detail="Read, reflect, make a short outline"
                onPress={() => onNext('input')}
              />
            )}
            <Row
              icon="videocam-outline"
              title="Take 1"
              detail="Speak naturally. Find your baseline."
              onPress={() => onNext('studio')}
            />
            <Row
              icon="sparkles-outline"
              title="Three things to work on"
              detail="A focused review before Take 2"
            />
            <Row icon="repeat-outline" title="Take 2" detail="Same topic. A clearer delivery." />
            <Row
              icon="chatbubble-ellipses-outline"
              title="The unexpected question"
              detail="Think on your feet after Take 2"
            />
            <View style={{ height: 1, backgroundColor: colors.line }} />
            <Row
              icon="create-outline"
              title="Writing desk"
              detail={
                day.writing === 'long' ? 'Put one idea into writing' : 'Say it in three sentences'
              }
              onPress={() => onNext('desk')}
            />
            <Row
              icon="lock-closed-outline"
              title="Private reflection"
              detail="Optional. Just for you."
              onPress={() => onNext('diary')}
            />
          </Card>
          <Text style={{ color: colors.muted, fontSize: 12, textAlign: 'center', padding: 4 }}>
            UI preview · tap through to explore the design
          </Text>
        </View>
      </ScrollView>
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 10,
          paddingBottom: Math.max(insets.bottom, 18),
        }}
      >
        <Action
          label={day.preparation ? 'START MY PRACTICE' : 'OPEN STUDIO'}
          onPress={() => onNext(day.preparation ? 'input' : 'studio')}
        />
      </View>
    </View>
  );
}

function DraftField({
  label,
  value,
  onChange,
  lines = 3,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  lines?: number;
}) {
  return (
    <View style={{ gap: 9 }}>
      <Text style={{ fontSize: 16, fontWeight: '600', color: colors.ink }}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        multiline
        value={value}
        onChangeText={onChange}
        textAlignVertical="top"
        style={{
          backgroundColor: 'white',
          borderRadius: 13,
          borderWidth: 1,
          borderColor: '#C6CCD6',
          minHeight: lines * 24 + 28,
          padding: 14,
          fontSize: 16,
          lineHeight: 24,
          color: colors.ink,
        }}
      />
    </View>
  );
}
export function PreviewPreparation({
  stage,
  dayNo,
  onBack,
  onNext,
}: PracticeNavigation & { stage: 'input' | 'think' | 'outline' }) {
  const day = curriculum[dayNo - 1];
  const [draft, setDraft] = useState(['', '', '', '']);
  const labels =
    stage === 'think'
      ? ['What happened?', 'Why does it matter?', 'What are the trade-offs?', 'What do I think?']
      : ['Opening', 'Main point', 'Example', 'Closing'];
  const valid =
    draft.every((value) => value.trim()) &&
    (stage !== 'outline' || draft.every((value) => value.trim().split(/\s+/).length <= 8));
  if (stage === 'input')
    return (
      <Page
        title="Input"
        onBack={onBack}
        footer={<Action label="WRITE MY OWN THOUGHTS" onPress={() => onNext('think')} />}
      >
        <Title>{day.topic}</Title>
        <Copy muted>Start by noticing. Then decide what you think.</Copy>
        <Card>
          <Icon name="book-outline" size={36} />
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.ink }}>
            A little input. Your own perspective.
          </Text>
          <Copy>
            This area will hold your reading or listening material for the day. Afterward, you will
            write your thoughts before seeing the Coach’s view.
          </Copy>
        </Card>
        <Copy small muted>
          Layout preview: no article has been fetched or generated.
        </Copy>
      </Page>
    );
  return (
    <Page
      title={stage === 'think' ? 'Think' : 'Outline'}
      onBack={onBack}
      footer={
        <>
          <Copy small muted>
            {stage === 'think'
              ? 'Your words first. AI suggestions come later.'
              : 'Four short cues. Up to eight words each.'}
          </Copy>
          <Action
            label={stage === 'think' ? 'SUBMIT MY THINKING' : 'OPEN STUDIO'}
            disabled={!valid}
            onPress={() => onNext(stage === 'think' ? 'outline' : 'studio')}
          />
        </>
      }
    >
      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
        <Icon name="checkmark-circle" color="#34715C" size={19} />
        <Copy muted small>
          Input
        </Copy>
        <Icon name="chevron-forward" size={14} />
        <Text style={{ color: colors.blue, fontWeight: '700' }}>
          {stage === 'think' ? 'Think' : 'Outline'}
        </Text>
      </View>
      <Title>{day.topic}</Title>
      <Copy muted>
        {stage === 'think'
          ? 'Four thoughts. Your own words.'
          : 'Keep the shape of your idea, not a script.'}
      </Copy>
      {labels.map((label, index) => (
        <DraftField
          key={label}
          label={'0' + (index + 1) + '  ' + label}
          value={draft[index]}
          onChange={(value) =>
            setDraft((previous) => previous.map((item, i) => (i === index ? value : item)))
          }
          lines={stage === 'outline' ? 1 : 3}
        />
      ))}
      <Copy small muted>
        Preview text is kept only while this screen stays open.
      </Copy>
    </Page>
  );
}

export function PreviewStudio({
  take,
  onBack,
  onNext,
}: {
  take: number;
  onBack: () => void;
  onNext: () => void;
}) {
  const [recording, setRecording] = useState(false),
    [confidence, setConfidence] = useState<number | null>(null);
  return (
    <Page
      title={'Take ' + take}
      onBack={onBack}
      footer={
        <Action
          recording
          label={recording ? 'FINISH PREVIEW TAKE' : 'PREVIEW RECORDING'}
          disabled={!recording && confidence === null}
          onPress={() => {
            if (recording) onNext();
            else setRecording(true);
          }}
        />
      }
    >
      <View
        style={{
          minHeight: 300,
          borderRadius: 24,
          backgroundColor: '#161D2B',
          padding: 26,
          justifyContent: 'center',
          alignItems: 'center',
          gap: 20,
        }}
      >
        <View
          style={{
            width: 92,
            height: 92,
            borderRadius: 46,
            borderWidth: 2,
            borderColor: recording ? '#D25365' : '#58657D',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Icon name={recording ? 'mic-outline' : 'videocam-outline'} size={40} color="white" />
        </View>
        <Text style={{ color: 'white', fontSize: 23, fontWeight: '600' }}>
          {recording ? 'Find your own words.' : 'A little courage. Just press record.'}
        </Text>
        <Text style={{ color: '#BBC5D6', lineHeight: 22, fontSize: 14, textAlign: 'center' }}>
          {recording
            ? 'No script. No topic on screen.\nThis is a layout simulation, not a recording.'
            : 'Your front camera will appear here.\nCamera access is off in this design preview.'}
        </Text>
      </View>
      {!recording && (
        <Card>
          <Copy>How confident do you feel?</Copy>
          <View style={{ flexDirection: 'row', gap: 9 }}>
            {[1, 2, 3, 4, 5].map((value) => (
              <Pressable
                key={value}
                accessibilityRole="radio"
                accessibilityLabel={'Confidence ' + value + ' of 5'}
                accessibilityState={{ selected: confidence === value }}
                onPress={() => setConfidence(value)}
                style={{
                  flex: 1,
                  height: 48,
                  backgroundColor: confidence === value ? colors.blue : '#EDF1FC',
                  borderRadius: 13,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: '600',
                    color: confidence === value ? 'white' : colors.blue,
                  }}
                >
                  {value}
                </Text>
              </Pressable>
            ))}
          </View>
          <Copy muted small>
            1 · Unsure 5 · Ready to speak
          </Copy>
        </Card>
      )}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Icon name="shield-checkmark-outline" size={20} />
        <View style={{ flex: 1 }}>
          <Copy small muted>
            Video stays on your phone. In the finished app, only audio is sent when you choose
            Analyse.
          </Copy>
        </View>
      </View>
    </Page>
  );
}

export function PreviewCoach({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  return (
    <Page
      title="Coach"
      onBack={onBack}
      footer={<Action label="TRY THESE IN TAKE 2" onPress={onNext} />}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View
          style={{
            width: 46,
            height: 46,
            borderRadius: 15,
            backgroundColor: '#E4EBFF',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Icon name="sparkles-outline" />
        </View>
        <View>
          <Text style={{ fontSize: 12, letterSpacing: 1, fontWeight: '700', color: colors.blue }}>
            ILLUSTRATIVE FEEDBACK
          </Text>
          <Copy muted small>
            Not an analysis of your voice
          </Copy>
        </View>
      </View>
      <Title>{'A clearer point.\nA calmer delivery.'}</Title>
      <Copy muted>One strength to keep. Three things to try.</Copy>
      <View style={{ backgroundColor: '#EAF4ED', padding: 20, borderRadius: 20, gap: 10 }}>
        <Icon name="checkmark-circle-outline" color="#34715C" />
        <Text style={{ fontSize: 17, fontWeight: '700', color: '#285A42' }}>
          Keep the personal example
        </Text>
        <Copy>Your example makes the idea easier to connect with.</Copy>
      </View>
      <Card>
        {[
          ['Lead with the point', 'Say your main idea in the first sentence.'],
          ['Make one example count', 'Choose one specific moment, then explain why it matters.'],
          ['Give the ending a little space', 'Pause, then land your final thought.'],
        ].map(([title, detail], index) => (
          <View key={title} style={{ flexDirection: 'row', gap: 14, paddingVertical: 8 }}>
            <Text style={{ color: colors.blue, fontSize: 23, fontWeight: '700' }}>
              0{index + 1}
            </Text>
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={{ fontSize: 17, fontWeight: '700', color: colors.ink }}>{title}</Text>
              <Copy muted>{detail}</Copy>
            </View>
          </View>
        ))}
      </Card>
      <Copy small muted>
        The real Coach will use your audio. This sample only demonstrates the hierarchy and
        correction cards. Your follow-up question stays hidden.
      </Copy>
    </Page>
  );
}

export function PreviewWriting({
  reflection,
  dayNo,
  onBack,
}: {
  reflection: boolean;
  dayNo: number;
  onBack: () => void;
}) {
  const [draft, setDraft] = useState(''),
    [saved, setSaved] = useState(false);
  return (
    <Page
      title={reflection ? 'Private reflection' : 'Writing desk'}
      onBack={onBack}
      footer={
        <Action
          label={saved ? 'BACK TO MY DAY' : 'KEEP IN THIS PREVIEW'}
          disabled={!draft.trim()}
          onPress={() => (saved ? onBack() : setSaved(true))}
        />
      }
    >
      <Icon name={reflection ? 'lock-closed-outline' : 'create-outline'} size={36} />
      <Title>
        {reflection
          ? 'A moment for yourself.'
          : curriculum[dayNo - 1].essay || 'One idea. Three sentences.'}
      </Title>
      <Copy muted>
        {reflection
          ? 'What felt easier today? What would you like to try next?'
          : 'Make your point in your own words.'}
      </Copy>
      <DraftField
        label={reflection ? 'My reflection' : 'My writing'}
        value={draft}
        onChange={(value) => {
          setDraft(value);
          setSaved(false);
        }}
        lines={9}
      />
      <Copy small muted>
        {saved
          ? 'Kept in this screen for review. Nothing was written to storage.'
          : reflection
            ? 'Private and optional. This text is never sent to AI.'
            : draft.trim().split(/\s+/).filter(Boolean).length + ' words · preview only'}
      </Copy>
    </Page>
  );
}
