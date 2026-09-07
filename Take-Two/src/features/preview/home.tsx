import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProgrammeHero } from '@/components/cards/programme-hero';
import { curriculum } from '@/features/programme/curriculum';
import { colors, Icon, Tabs, type TabName } from './components';

export function PreviewHome({
  onDay,
  onNavigate,
}: {
  onDay: (day: number) => void;
  onNavigate: (tab: TabName) => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 22 }}
      >
        <View
          style={{
            backgroundColor: colors.navy,
            paddingTop: insets.top + 22,
            paddingHorizontal: 22,
            paddingBottom: 60,
          }}
        >
          <View
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Text
              accessibilityRole="header"
              style={{ fontSize: 30, fontWeight: '700', color: 'white' }}
            >
              Take Two
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open preview settings"
              onPress={() => onNavigate('settings')}
              style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}
            >
              <Icon name="settings-outline" color="white" />
            </Pressable>
          </View>
          <Text style={{ fontSize: 14, color: '#E1E9FF', marginTop: 3 }}>
            Your 30-day communication practice
          </Text>
        </View>
        <View style={{ paddingHorizontal: 14, marginTop: -38, gap: 12 }}>
          <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 18, gap: 18 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.ink }}>
                Your first week
              </Text>
              <Text style={{ fontSize: 13, color: colors.muted }}>0 / 7 complete</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                <View
                  key={day}
                  style={{
                    width: 35,
                    height: 35,
                    borderRadius: 20,
                    backgroundColor: day === 1 ? 'white' : '#F1F2F5',
                    borderWidth: day === 1 ? 2 : 0,
                    borderColor: colors.blue,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: day === 1 ? '700' : '500',
                      color: day === 1 ? colors.blue : colors.ink,
                    }}
                  >
                    {day}
                  </Text>
                </View>
              ))}
            </View>
          </View>
          <ProgrammeHero
            dayNo={1}
            title={'Find your\nstarting point.'}
            topic="Tell me about yourself"
            detail="3 min speaking · Unprepared"
            action="BEGIN DAY 1"
            onPress={() => onDay(1)}
          />
          <View
            style={{
              flexDirection: 'row',
              gap: 8,
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 2,
            }}
          >
            <Icon name="shield-checkmark-outline" size={19} />
            <Text style={{ fontSize: 12, color: colors.muted }}>
              Your videos stay on your phone
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingHorizontal: 6,
              paddingTop: 0,
              alignItems: 'center',
            }}
          >
            <Text
              accessibilityRole="header"
              style={{ fontSize: 19, fontWeight: '700', color: colors.ink }}
            >
              Your programme
            </Text>
            <Text style={{ fontSize: 11, color: colors.muted }}>UI PREVIEW</Text>
          </View>
          <View style={{ gap: 10 }}>
            {curriculum.map((day) => (
              <Pressable
                key={day.dayNo}
                accessibilityRole="button"
                accessibilityLabel={'Preview day ' + day.dayNo + ': ' + day.topic}
                onPress={() => onDay(day.dayNo)}
                style={({ pressed }) => ({
                  minHeight: 72,
                  backgroundColor: pressed ? '#E6EBF8' : '#EFF1F5',
                  borderRadius: 19,
                  padding: 12,
                  flexDirection: 'row',
                  gap: 14,
                  alignItems: 'center',
                })}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 13,
                    backgroundColor: '#DFE7FA',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Icon
                    name={
                      day.extended
                        ? 'flag-outline'
                        : day.preparation
                          ? 'chatbubbles-outline'
                          : 'mic-outline'
                    }
                    size={25}
                  />
                </View>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={{ fontSize: 17, fontWeight: '700', color: colors.ink }}>
                    Day {day.dayNo}
                  </Text>
                  <Text
                    numberOfLines={2}
                    style={{ fontSize: 13, lineHeight: 18, color: colors.muted }}
                  >
                    {day.dayNo === 1 ? 'Your speaking baseline' : day.topic}
                  </Text>
                </View>
                <Icon name="chevron-forward" size={20} color="#89909D" />
              </Pressable>
            ))}
          </View>
          <Text style={{ fontSize: 12, lineHeight: 19, color: colors.muted, padding: 6 }}>
            Design preview. Explore any day. Nothing is recorded, sent to AI or saved as programme
            progress.
          </Text>
        </View>
      </ScrollView>
      <Tabs active="home" onNavigate={onNavigate} />
    </View>
  );
}
