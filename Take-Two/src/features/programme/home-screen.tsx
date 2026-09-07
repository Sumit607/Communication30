import { router } from 'expo-router';
import { Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDatabase } from '@/db/use-database';
import { activeProgramme, programmeDays, startProgramme } from '@/db/repositories/programme';
import { ProgrammeHero } from '@/components/cards/programme-hero';
import { BottomNavigation } from '@/components/ui/bottom-navigation';
import { curriculum } from './curriculum';
export default function HomeScreen() {
  const { db, refresh } = useDatabase(),
    insets = useSafeAreaInsets();
  const programme = activeProgramme(db),
    days = programmeDays(db),
    completed = days.filter((day) => day.completedAt).length,
    next = days.find((day) => !day.completedAt),
    nextNo = next?.dayNo ?? 1;
  const weekStart = Math.min(29, Math.floor(Math.min(completed, 29) / 7) * 7 + 1),
    weekDays = curriculum.filter((day) => day.dayNo >= weekStart && day.dayNo < weekStart + 7),
    weekCompleted = days.filter(
      (day) => day.dayNo >= weekStart && day.dayNo < weekStart + 7 && day.completedAt,
    ).length;
  function begin() {
    if (!programme) {
      startProgramme(db);
      refresh();
      const first = programmeDays(db)[0];
      router.push({ pathname: '/day/[dayId]', params: { dayId: first.id } });
    } else if (next) {
      router.push({ pathname: '/day/[dayId]', params: { dayId: next.id } });
    } else router.push('/progress');
  }
  return (
    <View style={{ flex: 1, backgroundColor: '#F7F8FA' }}>
      <View style={{ flex: 1, width: '100%', maxWidth: 430, alignSelf: 'center' }}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{
              backgroundColor: '#0C40DB',
              paddingTop: insets.top + 26,
              paddingHorizontal: 22,
              paddingBottom: 60,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Text
                accessibilityRole="header"
                style={{ fontSize: 30, fontWeight: '700', color: 'white' }}
              >
                Take Two
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Open settings"
                onPress={() => router.push('/settings')}
                style={{ width: 48, height: 48, justifyContent: 'center', alignItems: 'center' }}
              >
                <Ionicons name="settings-outline" size={25} color="white" />
              </Pressable>
            </View>
            <Text style={{ fontSize: 14, color: '#E1E9FF', marginTop: 3 }}>
              Your 30-day communication practice
            </Text>
          </View>
          <View style={{ paddingHorizontal: 14, gap: 14, marginTop: -38 }}>
            <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 20, gap: 18 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#1C2027' }}>
                  {weekStart === 1
                    ? 'Your first week'
                    : 'Practice week ' + (Math.floor((weekStart - 1) / 7) + 1)}
                </Text>
                <Text style={{ fontSize: 13, color: '#777D86' }}>
                  {weekCompleted} / {weekDays.length} complete
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                {weekDays.map((day) => {
                  const done = !!days[day.dayNo - 1]?.completedAt,
                    active = day.dayNo === nextNo;
                  return (
                    <View
                      key={day.dayNo}
                      accessibilityLabel={
                        'Curriculum day ' +
                        day.dayNo +
                        (done ? ', complete' : active ? ', next' : ', upcoming')
                      }
                      style={{
                        width: 35,
                        height: 35,
                        borderRadius: 20,
                        backgroundColor: done ? '#34715C' : active ? 'white' : '#F1F2F5',
                        borderWidth: active ? 2 : 0,
                        borderColor: '#1748E5',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {done ? (
                        <Ionicons name="checkmark" color="white" size={19} />
                      ) : (
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: active ? '700' : '500',
                            color: active ? '#1748E5' : '#292D35',
                          }}
                        >
                          {day.dayNo}
                        </Text>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
            <ProgrammeHero
              dayNo={nextNo}
              title={
                completed === 0
                  ? 'Find your\nstarting point.'
                  : completed === 30
                    ? 'Look how far\nyou have come.'
                    : 'Keep finding\nyour voice.'
              }
              topic={next?.brief ?? 'Tell me about yourself'}
              detail={
                Math.round((next ? curriculum[next.dayNo - 1].durationS : 180) / 60) +
                ' min speaking · ' +
                ((next ? curriculum[next.dayNo - 1].preparation : false)
                  ? 'Think first'
                  : 'Unprepared')
              }
              action={
                completed === 30
                  ? 'VIEW MY PROGRESS'
                  : (programme ? 'CONTINUE DAY ' : 'BEGIN DAY ') + nextNo
              }
              onPress={begin}
            />
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                paddingVertical: 2,
              }}
            >
              <Ionicons name="shield-checkmark-outline" size={20} color="#1748E5" />
              <Text style={{ fontSize: 12, color: '#777D86' }}>Your videos stay on your phone</Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 6,
                paddingTop: 4,
              }}
            >
              <Text
                accessibilityRole="header"
                style={{ fontSize: 19, fontWeight: '700', color: '#1C2027' }}
              >
                Your programme
              </Text>
              <Text style={{ fontSize: 12, color: '#777D86' }}>{completed} of 30 complete</Text>
            </View>
            <View style={{ gap: 10 }}>
              {curriculum.map((policy) => {
                const day = days[policy.dayNo - 1],
                  unlocked = !!day && day.dayNo <= completed + 1,
                  done = !!day?.completedAt;
                return (
                  <Pressable
                    key={policy.dayNo}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: !unlocked }}
                    disabled={!unlocked}
                    onPress={() =>
                      router.push({ pathname: '/day/[dayId]', params: { dayId: day.id } })
                    }
                    style={({ pressed }) => ({
                      minHeight: 77,
                      borderRadius: 19,
                      backgroundColor: pressed ? '#E9EDF9' : '#F0F2F6',
                      padding: 14,
                      flexDirection: 'row',
                      gap: 14,
                      alignItems: 'center',
                    })}
                  >
                    <View
                      style={{
                        height: 48,
                        width: 48,
                        borderRadius: 13,
                        backgroundColor: '#DEE6FA',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Ionicons
                        name={policy.extended ? 'flag-outline' : 'mic-outline'}
                        size={26}
                        color="#1748E5"
                      />
                    </View>
                    <View style={{ flex: 1, gap: 5 }}>
                      <Text style={{ fontSize: 17, fontWeight: '700', color: '#1C2027' }}>
                        Day {policy.dayNo}
                      </Text>
                      <Text
                        numberOfLines={2}
                        style={{ fontSize: 13, lineHeight: 18, color: '#777D86' }}
                      >
                        {policy.dayNo === 1 ? 'Your speaking baseline' : policy.topic}
                      </Text>
                    </View>
                    <Ionicons
                      name={
                        done
                          ? 'checkmark-circle'
                          : unlocked
                            ? 'chevron-forward'
                            : 'lock-closed-outline'
                      }
                      size={21}
                      color={done ? '#34715C' : '#8D929B'}
                    />
                  </Pressable>
                );
              })}
            </View>
            {Platform.OS === 'web' && (
              <Text style={{ fontSize: 12, lineHeight: 18, color: '#777D86', padding: 6 }}>
                Browser preview: practice data resets on reload. The Android app saves data on your
                phone.
              </Text>
            )}
          </View>
        </ScrollView>
        <BottomNavigation active="practice" />
      </View>
    </View>
  );
}
