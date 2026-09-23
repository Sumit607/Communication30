import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Body, Button, Heading, Notice } from '@/components/ui/controls';
import { Screen } from '@/components/ui/screen';
import { Playback } from '@/components/recording/playback';
import { AiDisclosure } from '@/components/ui/ai-disclosure';
import { useDatabase } from '@/db/use-database';
import { dayTakes } from '@/db/repositories/recording';
import { originalCoach, reviewCoach } from '@/db/repositories/coaching';
import { analyseTake } from '@/services/coaching-service';
import { useAction } from '@/hooks/use-action';
import { theme } from '@/constants/theme';
import { ActionPillarCard } from '@/components/cards/action-pillar-card';
import { buildPillarData } from '@/features/coach/build-pillar-data';
import { ScorecardView } from '@/features/coach/scorecard-view';

type TabType = 'action' | 'scorecard' | 'transcript';

export default function CoachScreen() {
  const { dayId } = useLocalSearchParams<{ dayId: string }>();
  const { db, refresh } = useDatabase(),
    action = useAction(refresh);
  const saved = dayTakes(db, dayId).filter((take) => take.state === 'saved'),
    first = saved[0],
    coach = originalCoach(db, dayId);

  const [activeTab, setActiveTab] = useState<TabType>('action');
  const [play, setPlay] = useState(false);

  const pillars = useMemo(() => {
    if (!coach) return null;
    return buildPillarData(coach.result, coach.row?.paceWpm);
  }, [coach]);

  const transcriptWordCount = coach?.result.transcript
    ? coach.result.transcript.trim().split(/\s+/).filter(Boolean).length
    : 0;

  return (
    <Screen
      title={coach ? 'Coach · Take 1 Analysis' : 'Coach · Take 1'}
      footer={
        first && (
          <Button
            busy={action.busy}
            label={
              coach
                ? saved.length > 1
                  ? 'Compare my takes'
                  : 'Try these in Take 2'
                : 'Analyse Take 1 audio'
            }
            onPress={() =>
              action.run(async (signal) => {
                if (!coach) await analyseTake(db, dayId, first.id, signal);
                else {
                  reviewCoach(db, dayId);
                  refresh();
                  router.push({
                    pathname: saved.length > 1 ? '/day/[dayId]/compare' : '/day/[dayId]/studio',
                    params: { dayId },
                  });
                }
              })
            }
          />
        )
      }
    >
      {!first ? (
        <View style={{ gap: 16 }}>
          <Heading>Your first take comes first.</Heading>
          <Body>Record your initial presentation in the Studio before receiving coaching.</Body>
          <Button
            label="Open Studio"
            onPress={() => router.replace({ pathname: '/day/[dayId]/studio', params: { dayId } })}
          />
        </View>
      ) : (
        <View style={{ gap: 16 }}>
          {coach && pillars ? (
            <>
              {/* Executive Summary Card */}
              <View
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 20,
                  padding: 18,
                  borderWidth: 1,
                  borderColor: theme.line,
                  gap: 14,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <View>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '700',
                        color: theme.muted,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                      }}
                    >
                      Take 1 Performance
                    </Text>
                    <View
                      style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 2 }}
                    >
                      <Text style={{ fontSize: 32, fontWeight: '800', color: theme.ink }}>
                        {coach.row?.overall ?? 7}
                      </Text>
                      <Text style={{ fontSize: 16, color: theme.muted, fontWeight: '600' }}>
                        / 10
                      </Text>
                    </View>
                  </View>

                  {coach.row?.paceWpm != null && coach.row.paceWpm > 0 && (
                    <View
                      style={{
                        backgroundColor: '#F0F4F9',
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 12,
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ fontSize: 16, fontWeight: '700', color: theme.ink }}>
                        {Math.round(coach.row.paceWpm)} WPM
                      </Text>
                      <Text style={{ fontSize: 11, color: theme.muted, fontWeight: '500' }}>
                        Speech Pace
                      </Text>
                    </View>
                  )}
                </View>

                {/* Core Strength Callout */}
                <View
                  style={{
                    backgroundColor: '#EAF4ED',
                    borderRadius: 12,
                    padding: 12,
                    flexDirection: 'row',
                    gap: 10,
                    alignItems: 'flex-start',
                  }}
                >
                  <Ionicons
                    name="ribbon"
                    size={20}
                    color={theme.success}
                    style={{ marginTop: 1 }}
                  />
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '700',
                        color: theme.success,
                        letterSpacing: 0.4,
                      }}
                    >
                      FOUNDATIONAL STRENGTH TO PRESERVE
                    </Text>
                    <Text
                      style={{ fontSize: 13, color: theme.ink, lineHeight: 18, fontWeight: '500' }}
                    >
                      {coach.result.strength}
                    </Text>
                  </View>
                </View>
              </View>

              {/* 3-Tab Segmented Selector */}
              <View
                style={{
                  flexDirection: 'row',
                  backgroundColor: '#ECEEF2',
                  borderRadius: 14,
                  padding: 4,
                  gap: 4,
                }}
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Action Plan tab"
                  onPress={() => setActiveTab('action')}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 10,
                    backgroundColor: activeTab === 'action' ? '#FFFFFF' : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '700',
                      color: activeTab === 'action' ? theme.ink : theme.muted,
                    }}
                  >
                    Action Plan
                  </Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Scorecard tab"
                  onPress={() => setActiveTab('scorecard')}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 10,
                    backgroundColor: activeTab === 'scorecard' ? '#FFFFFF' : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '700',
                      color: activeTab === 'scorecard' ? theme.ink : theme.muted,
                    }}
                  >
                    Scorecard
                  </Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Transcript tab"
                  onPress={() => setActiveTab('transcript')}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 10,
                    backgroundColor: activeTab === 'transcript' ? '#FFFFFF' : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '700',
                      color: activeTab === 'transcript' ? theme.ink : theme.muted,
                    }}
                  >
                    Transcript
                  </Text>
                </Pressable>
              </View>

              {/* Tab 1: Action Plan (3 Detailed Expandable Pillars) */}
              {activeTab === 'action' && (
                <View style={{ gap: 6 }}>
                  <Text style={{ fontSize: 13, color: theme.muted, marginBottom: 8 }}>
                    Tap any pillar to open 10–12 diagnostic checkpoints, Take 1 evidence, and direct
                    fixes for Take 2:
                  </Text>
                  {pillars.map((pillar) => (
                    <ActionPillarCard key={pillar.id} pillar={pillar} />
                  ))}

                  <View
                    style={{
                      backgroundColor: '#F5F7FA',
                      borderRadius: 14,
                      padding: 14,
                      borderWidth: 1,
                      borderColor: theme.line,
                      marginTop: 4,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <Ionicons name="sparkles-outline" size={18} color={theme.accent} />
                    <Text style={{ fontSize: 12, color: theme.muted, flex: 1, lineHeight: 16 }}>
                      Apply 2–3 key adjustments in Take 2 while keeping your core message authentic
                      and relaxed.
                    </Text>
                  </View>
                </View>
              )}

              {/* Tab 2: Scorecard (6 Dimensions & Rubric) */}
              {activeTab === 'scorecard' && (
                <ScorecardView
                  scores={coach.result.scores}
                  overallScore={coach.row?.overall ?? 7}
                  paceWpm={coach.row?.paceWpm}
                />
              )}

              {/* Tab 3: Transcript & Audio */}
              {activeTab === 'transcript' && (
                <View style={{ gap: 14 }}>
                  {/* Take 1 Audio/Video Playback */}
                  {first.filePath && (
                    <View
                      style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: 18,
                        padding: 16,
                        borderWidth: 1,
                        borderColor: theme.line,
                        gap: 10,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Text style={{ fontSize: 14, fontWeight: '700', color: theme.ink }}>
                          Take 1 Recording Playback
                        </Text>
                        <Button
                          secondary
                          label={play ? 'Hide player' : 'Play recording'}
                          onPress={() => setPlay(!play)}
                        />
                      </View>
                      {play && <Playback uri={first.filePath} />}
                    </View>
                  )}

                  {/* Verbatim Transcript */}
                  <View
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: 18,
                      padding: 18,
                      borderWidth: 1,
                      borderColor: theme.line,
                      gap: 12,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Text style={{ fontSize: 15, fontWeight: '700', color: theme.ink }}>
                        Verbatim Transcript
                      </Text>
                      <Text style={{ fontSize: 12, color: theme.muted }}>
                        {transcriptWordCount} words
                      </Text>
                    </View>

                    <View
                      style={{
                        backgroundColor: '#F9FAFC',
                        borderRadius: 12,
                        padding: 14,
                        borderLeftWidth: 3,
                        borderLeftColor: theme.accent,
                      }}
                    >
                      <Text style={{ fontSize: 14, color: theme.ink, lineHeight: 22 }}>
                        {coach.result.transcript}
                      </Text>
                    </View>

                    <Text style={{ fontSize: 12, color: theme.muted, fontStyle: 'italic' }}>
                      Transcribed locally by Gemini Free Tier from extracted audio only.
                    </Text>
                  </View>
                </View>
              )}
            </>
          ) : (
            /* Unanalysed State */
            <>
              <Heading>Find your next improvement.</Heading>
              <Body>
                Detailed, objective feedback across 3 core pillars: Structure & Framing, Language &
                Clarity, and Delivery & Vocal Presence.
              </Body>

              <View
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 18,
                  padding: 18,
                  borderWidth: 1,
                  borderColor: theme.line,
                  gap: 12,
                  marginVertical: 4,
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '700', color: theme.ink }}>
                  What you&apos;ll receive:
                </Text>
                <View style={{ gap: 8 }}>
                  <Text style={{ fontSize: 13, color: theme.ink }}>
                    <Text style={{ fontWeight: '700', color: theme.accent }}>
                      1. Structure & Framing:{' '}
                    </Text>
                    Opening hook, logical progression, and conclusion strength.
                  </Text>
                  <Text style={{ fontSize: 13, color: theme.ink }}>
                    <Text style={{ fontWeight: '700', color: theme.accent }}>
                      2. Language & Clarity:{' '}
                    </Text>
                    Conciseness, filler density, and vocabulary precision.
                  </Text>
                  <Text style={{ fontSize: 13, color: theme.ink }}>
                    <Text style={{ fontWeight: '700', color: theme.accent }}>
                      3. Delivery & Presence:{' '}
                    </Text>
                    Speech pace (WPM), pausing, and vocal conviction.
                  </Text>
                </View>
              </View>

              <AiDisclosure />

              {first.filePath && (
                <View style={{ marginTop: 8 }}>
                  <Button
                    secondary
                    label={play ? 'Close recording playback' : 'Play my first recording'}
                    onPress={() => setPlay(!play)}
                  />
                  {play && (
                    <View style={{ marginTop: 10 }}>
                      <Playback uri={first.filePath} />
                    </View>
                  )}
                </View>
              )}
            </>
          )}

          {action.busy && (
            <View
              style={{
                backgroundColor: '#EBF2FC',
                padding: 16,
                borderRadius: 14,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <Ionicons name="sync" size={20} color={theme.accent} />
              <Body>Analysing audio… Your recording is safely saved locally.</Body>
            </View>
          )}

          {action.error && <Notice>{action.error}</Notice>}
        </View>
      )}
    </Screen>
  );
}
