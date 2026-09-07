import { useEffect, useState } from 'react';
import { BackHandler, Platform, Switch, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Action, Card, colors, Copy, Icon, Page, Row, Title, type TabName } from './components';
import { PreviewHome } from './home';
import {
  PreviewCoach,
  PreviewDay,
  PreviewPreparation,
  PreviewStudio,
  PreviewWriting,
  type PracticeStage,
} from './practice';

type Location = { screen: TabName | PracticeStage; dayNo: number; take: number };
const initial: Location = { screen: 'home', dayNo: 1, take: 1 };

export default function PreviewApp() {
  const [history, setHistory] = useState<Location[]>([initial]);
  const [reminder, setReminder] = useState(false);
  const location = history[history.length - 1];
  const { screen, dayNo, take } = location;
  function back() {
    setHistory((previous) => (previous.length > 1 ? previous.slice(0, -1) : [initial]));
  }
  function go(next: Location['screen'], overrides: Partial<Location> = {}) {
    setHistory((previous) => [
      ...previous,
      { ...previous[previous.length - 1], screen: next, ...overrides },
    ]);
  }
  function navigate(tab: TabName) {
    setHistory([{ ...initial, screen: tab }]);
  }
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const listener = BackHandler.addEventListener('hardwareBackPress', () => {
      if (history.length <= 1 && screen === 'home') return false;
      back();
      return true;
    });
    return () => listener.remove();
  }, [history.length, screen]);
  let content;
  if (screen === 'home')
    content = (
      <PreviewHome
        onDay={(number) => go('day', { dayNo: number, take: 1 })}
        onNavigate={navigate}
      />
    );
  else if (screen === 'day') content = <PreviewDay dayNo={dayNo} onBack={back} onNext={go} />;
  else if (screen === 'input' || screen === 'think' || screen === 'outline')
    content = (
      <PreviewPreparation
        key={screen + dayNo}
        stage={screen}
        dayNo={dayNo}
        onBack={back}
        onNext={go}
      />
    );
  else if (screen === 'studio')
    content = (
      <PreviewStudio
        key={take}
        take={take}
        onBack={back}
        onNext={() => go(take === 1 ? 'coach' : 'compare')}
      />
    );
  else if (screen === 'coach')
    content = <PreviewCoach onBack={back} onNext={() => go('studio', { take: 2 })} />;
  else if (screen === 'desk' || screen === 'diary')
    content = (
      <PreviewWriting key={screen} reflection={screen === 'diary'} dayNo={dayNo} onBack={back} />
    );
  else if (screen === 'compare')
    content = (
      <Page
        title="Compare"
        onBack={back}
        footer={<Action label="REVEAL MY FOLLOW-UP" onPress={() => go('followup')} />}
      >
        <Icon name="git-compare-outline" size={36} />
        <Title>Notice what changed.</Title>
        <Copy muted>Your first attempt and your second, side by side.</Copy>
        <Card>
          <Row title="Take 1" detail="Your starting point" icon="play-circle-outline" />
          <Row
            title="Take 2"
            detail="Your three corrections in practice"
            icon="play-circle-outline"
          />
        </Card>
        <Copy>
          No recordings or scores are attached to this preview. In the app, you will replay both
          takes and see what improved.
        </Copy>
        <Card>
          <Icon name="chatbubble-ellipses-outline" />
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.ink }}>
            One more thing.
          </Text>
          <Copy muted>A question you have not prepared for. Reveal it when you are ready.</Copy>
        </Card>
      </Page>
    );
  else if (screen === 'followup')
    content = (
      <Page
        title="On the spot"
        onBack={back}
        footer={<Action label="CONTINUE TO WRITING" onPress={() => go('desk')} />}
      >
        <Text style={{ color: colors.blue, fontSize: 12, fontWeight: '700', letterSpacing: 1 }}>
          SAMPLE FOLLOW-UP
        </Text>
        <Title>What is one experience that changed the way you communicate?</Title>
        <Copy muted>Take a breath. Find your point. Answer in your own words.</Copy>
        <Card>
          <Icon name="mic-outline" size={36} />
          <Copy>
            The finished app will capture your answer and thinking time. This preview reveals the
            question layout only.
          </Copy>
        </Card>
      </Page>
    );
  else if (screen === 'progress')
    content = (
      <Page title="Your progress" tab="progress" onNavigate={navigate}>
        <View style={{ paddingVertical: 16, gap: 18 }}>
          <Icon name="bar-chart-outline" size={42} />
          <Title>{'Small steps.\nA voice that feels like you.'}</Title>
          <Copy muted>Build evidence through practice, one day at a time.</Copy>
        </View>
        <Card>
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.ink }}>
            Your journey starts here
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
            <Text style={{ fontSize: 46, fontWeight: '700', color: colors.blue }}>0</Text>
            <Copy muted>of 30 days complete</Copy>
          </View>
          <View style={{ height: 6, borderRadius: 4, backgroundColor: colors.line }} />
          <Copy small muted>
            No practice data yet. Previewing a screen never completes a day.
          </Copy>
        </Card>
        <Card>
          <Row
            icon="trending-up-outline"
            title="Day 1 → Day 30"
            detail="Your improvement, backed by your takes"
          />
          <Row
            icon="heart-outline"
            title="Confidence"
            detail="How you feel before and after speaking"
          />
          <Row
            icon="chatbubbles-outline"
            title="Thinking on your feet"
            detail="Your follow-up answers over time"
          />
        </Card>
        <Action label="EXPLORE MY PRACTICE" onPress={() => navigate('home')} />
      </Page>
    );
  else
    content = (
      <Page title="You" tab="settings" onNavigate={navigate}>
        <Card>
          <View style={{ flexDirection: 'row', gap: 15, alignItems: 'center' }}>
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: '#E7EDFF',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Icon name="person-outline" size={29} />
            </View>
            <View style={{ flex: 1, gap: 5 }}>
              <Text style={{ fontSize: 20, fontWeight: '700', color: colors.ink }}>
                Your space to practise
              </Text>
              <Copy muted small>
                No account. No audience. Just you.
              </Copy>
            </View>
          </View>
        </Card>
        <Card>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.ink }}>
            Make room for a little practice
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Icon name="notifications-outline" />
            <View style={{ flex: 1, gap: 3 }}>
              <Copy>Daily reminder</Copy>
              <Copy small muted>
                6:00 PM · display preview only
              </Copy>
            </View>
            <Switch
              accessibilityLabel="Preview daily reminder"
              value={reminder}
              onValueChange={setReminder}
              trackColor={{ false: '#CDD3DE', true: colors.blue }}
            />
          </View>
        </Card>
        <Card>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.ink }}>
            Explore the design
          </Text>
          <Row
            icon="mic-outline"
            title="Day 1 · Baseline"
            detail="Unprepared speaking flow"
            onPress={() => go('day', { dayNo: 1, take: 1 })}
          />
          <Row
            icon="create-outline"
            title="Day 3 · Think first"
            detail="Blank thinking fields and outline"
            onPress={() => go('day', { dayNo: 3, take: 1 })}
          />
          <Row
            icon="sparkles-outline"
            title="Coach layout"
            detail="Clearly labelled illustrative feedback"
            onPress={() => go('coach', { take: 1 })}
          />
          <Row
            icon="lock-closed-outline"
            title="Private reflection"
            detail="A quiet place to reflect"
            onPress={() => go('diary')}
          />
        </Card>
        <Copy small muted>
          This is an interactive design prototype. Text and switches are temporary. Camera,
          microphone, AI, notifications and storage are inactive. Your API key is not used by this
          preview.
        </Copy>
        <Action
          label="RESET PREVIEW"
          secondary
          onPress={() => {
            setReminder(false);
            navigate('home');
          }}
        />
      </Page>
    );
  return (
    <SafeAreaProvider>
      <StatusBar style={screen === 'home' || screen === 'day' ? 'light' : 'dark'} />
      <View style={{ flex: 1, backgroundColor: '#E8ECF3' }}>
        <View
          style={{
            flex: 1,
            width: '100%',
            maxWidth: 430,
            alignSelf: 'center',
            backgroundColor: colors.background,
          }}
        >
          {content}
        </View>
      </View>
    </SafeAreaProvider>
  );
}
