import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Linking, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Field, Heading, Notice } from '@/components/ui/controls';
import { Screen } from '@/components/ui/screen';
import { useDatabase } from '@/db/use-database';
import { completeInput, loadPrep } from '@/db/repositories/prep';
import { dayTakes } from '@/db/repositories/recording';
import { originalCoach, takeFeedback } from '@/db/repositories/coaching';
import { getFollowupAttempt } from '@/db/repositories/live-response';
import { loadWriting } from '@/db/repositories/writing';
import { loadDiary } from '@/db/repositories/diary';
import { policyFor } from '@/features/programme/curriculum';
import { getDayResource } from '@/features/programme/day-resources';
import { DayMilestoneTile } from '@/components/cards/day-milestone-tile';
import { theme } from '@/constants/theme';

export default function DayScreen() {
  const { dayId } = useLocalSearchParams<{ dayId: string }>();
  const { db, refresh } = useDatabase();

  const prep = loadPrep(db, dayId);
  const { day, input, thinking, outline } = prep;
  const resource = getDayResource(day.dayNo, day.brief);

  const savedTakes = dayTakes(db, dayId).filter((t) => t.state === 'saved');
  const take1 = savedTakes[0];
  const take2 = savedTakes[1];

  const coach = originalCoach(db, dayId);
  const delta = take2 ? takeFeedback(db, take2.id, 'delta') : null;
  const liveAttempt = getFollowupAttempt(db, dayId);
  const writing = loadWriting(db, dayId);
  const diary = loadDiary(db, dayId);

  // Next day preview
  const nextPolicy = day.dayNo < 30 ? policyFor(day.dayNo + 1) : null;

  // Local quick-fact input state
  const [quickFact, setQuickFact] = useState(input?.memoryFact ?? '');
  const [factError, setFactError] = useState('');

  // Determine active/default milestone
  const activeMilestone = useMemo(() => {
    if (!input?.completedAt) return 'input';
    if (day.policy.preparation && (!thinking?.submittedAt || !outline)) return 'prep';
    if (!take1) return 'take1';
    if (!coach) return 'coach';
    if (!take2) return 'take2';
    if (!delta) return 'compare';
    if (!liveAttempt) return 'liveQ';
    if (!writing?.submittedAt || !diary) return 'reflect';
    return 'day2';
  }, [
    input?.completedAt,
    day.policy.preparation,
    thinking?.submittedAt,
    outline,
    take1,
    coach,
    take2,
    delta,
    liveAttempt,
    writing?.submittedAt,
    diary,
  ]);

  const [expandedId, setExpandedId] = useState<string | null>(activeMilestone);

  const toggleMilestone = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const openUrl = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      // URL open fallback handled silently
    }
  };

  const handleSaveQuickFact = () => {
    if (!quickFact.trim()) {
      setFactError('Write one key takeaway before saving.');
      return;
    }
    try {
      setFactError('');
      completeInput(
        db,
        dayId,
        resource.article.title || day.brief,
        resource.article.excerpt || resource.keyConcept,
        quickFact.trim(),
      );
      refresh();
    } catch (e) {
      setFactError((e as Error).message);
    }
  };

  // Next CTA button calculation
  const nextAction = useMemo(() => {
    if (!input?.completedAt) {
      return {
        label: 'Step 1: Review Input & Save Fact',
        route: '/day/[dayId]/input' as const,
      };
    }
    if (day.policy.preparation && (!thinking?.submittedAt || !outline)) {
      const prepRoute = !thinking?.submittedAt
        ? ('/day/[dayId]/prep' as const)
        : ('/day/[dayId]/outline' as const);
      return {
        label: 'Step 2: Build Outline',
        route: prepRoute,
      };
    }
    if (!take1) {
      return {
        label: 'Step 3: Record Take 1 in Studio',
        route: '/day/[dayId]/studio' as const,
      };
    }
    if (!coach) {
      return {
        label: 'Step 4: View AI Coach Analysis',
        route: '/day/[dayId]/coach' as const,
      };
    }
    if (!take2) {
      return {
        label: 'Step 5: Record Take 2 Reshoot',
        route: '/day/[dayId]/studio' as const,
      };
    }
    if (!delta) {
      return {
        label: 'Step 6: Compare Takes (Take 1 vs 2)',
        route: '/day/[dayId]/compare' as const,
      };
    }
    if (!liveAttempt) {
      return {
        label: 'Step 7: Answer Live Question',
        route: '/day/[dayId]/follow-up' as const,
      };
    }
    if (!writing?.submittedAt) {
      return {
        label: 'Step 8: Open Writing Desk',
        route: '/day/[dayId]/desk' as const,
      };
    }
    if (!diary) {
      return {
        label: 'Step 8: Complete Private Diary',
        route: '/day/[dayId]/diary' as const,
      };
    }
    return {
      label: `Day ${day.dayNo} Complete · View Progress`,
      route: '/progress' as const,
    };
  }, [
    input?.completedAt,
    day.policy.preparation,
    day.dayNo,
    thinking?.submittedAt,
    outline,
    take1,
    coach,
    take2,
    delta,
    liveAttempt,
    writing?.submittedAt,
    diary,
  ]);

  return (
    <Screen
      title={`Day ${day.dayNo}`}
      footer={
        <Button
          label={nextAction.label}
          onPress={() => {
            if (nextAction.route === '/progress') {
              router.push('/progress');
            } else {
              router.push({
                pathname: nextAction.route,
                params: { dayId },
              });
            }
          }}
        />
      }
    >
      {/* Executive Header */}
      <View style={{ gap: 6, marginBottom: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View
            style={{
              backgroundColor: '#EBF2FC',
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 6,
            }}
          >
            <Text
              style={{ fontSize: 11, fontWeight: '800', color: theme.accent, letterSpacing: 0.5 }}
            >
              DAY {day.dayNo < 10 ? `0${day.dayNo}` : day.dayNo} OF 30
            </Text>
          </View>
          <Text style={{ fontSize: 13, color: theme.muted, fontWeight: '500' }}>
            {Math.round(day.policy.durationS / 60)} min speaking · {day.policy.interaction}
          </Text>
        </View>

        <Heading>{day.brief}</Heading>
        <Text style={{ fontSize: 13, color: theme.muted, lineHeight: 18 }}>
          Tap any icon below to view direct links, take status, and step-by-step guidance.
        </Text>
      </View>

      {/* Accordion Milestone 1: Daily Input & Resources */}
      <DayMilestoneTile
        id="input"
        number={1}
        icon="play-circle-outline"
        title="Input & Resources"
        subtitle={
          input?.completedAt
            ? 'Curated video & article read · Key fact saved'
            : 'YouTube video & article ready to watch/read'
        }
        status={
          input?.completedAt ? 'completed' : activeMilestone === 'input' ? 'current' : 'locked'
        }
        expanded={expandedId === 'input'}
        onToggle={() => toggleMilestone('input')}
      >
        <Text style={{ fontSize: 13, color: theme.ink, lineHeight: 19 }}>
          Watch or read one finite piece of knowledge before forming your view:
        </Text>

        {/* YouTube Video Link Card */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Open YouTube video: ${resource.youtube.title}`}
          onPress={() => openUrl(resource.youtube.url)}
          style={({ pressed }) => ({
            backgroundColor: pressed ? '#FEECEB' : '#FFFFFF',
            borderRadius: 14,
            padding: 14,
            borderWidth: 1,
            borderColor: '#FCA5A5',
            gap: 8,
          })}
        >
          <View
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="logo-youtube" size={22} color="#EF4444" />
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#B91C1C' }}>
                YOUTUBE VIDEO
              </Text>
            </View>
            <View
              style={{
                backgroundColor: '#FEE2E2',
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 6,
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#B91C1C' }}>
                {resource.youtube.duration}
              </Text>
            </View>
          </View>
          <Text style={{ fontSize: 14, fontWeight: '700', color: theme.ink }}>
            {resource.youtube.title}
          </Text>
          <View
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Text style={{ fontSize: 12, color: theme.muted }}>{resource.youtube.channel}</Text>
            <Text style={{ fontSize: 12, fontWeight: '700', color: theme.accent }}>
              Watch on YouTube ↗
            </Text>
          </View>
        </Pressable>

        {/* Recommended Article Link Card */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Open article: ${resource.article.title}`}
          onPress={() => openUrl(resource.article.url)}
          style={({ pressed }) => ({
            backgroundColor: pressed ? '#EFF6FF' : '#FFFFFF',
            borderRadius: 14,
            padding: 14,
            borderWidth: 1,
            borderColor: '#BFDBFE',
            gap: 8,
          })}
        >
          <View
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="newspaper-outline" size={20} color={theme.accent} />
              <Text style={{ fontSize: 12, fontWeight: '700', color: theme.accent }}>
                CURATED ARTICLE
              </Text>
            </View>
            <View
              style={{
                backgroundColor: '#DBEAFE',
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 6,
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: '700', color: theme.accent }}>
                {resource.article.readTime}
              </Text>
            </View>
          </View>
          <Text style={{ fontSize: 14, fontWeight: '700', color: theme.ink }}>
            {resource.article.title}
          </Text>
          <Text style={{ fontSize: 12, color: theme.muted, lineHeight: 17 }}>
            {resource.article.excerpt}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 2,
            }}
          >
            <Text style={{ fontSize: 12, color: theme.muted }}>{resource.article.source}</Text>
            <Text style={{ fontSize: 12, fontWeight: '700', color: theme.accent }}>
              Read Article ↗
            </Text>
          </View>
        </Pressable>

        {/* One Fact Field */}
        <View style={{ gap: 8, marginTop: 4 }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: theme.ink }}>
            One Fact Worth Remembering:
          </Text>
          <Field
            label="Key takeaway"
            hint="Save one crisp insight you will weave into your thoughts."
            value={quickFact}
            onChangeText={setQuickFact}
            editable={!thinking?.submittedAt}
            compact
          />
          {factError ? <Notice>{factError}</Notice> : null}
          {!thinking?.submittedAt && (
            <Button
              secondary
              label={input?.completedAt ? 'Update saved fact' : 'Save fact & complete input'}
              onPress={handleSaveQuickFact}
            />
          )}
        </View>

        <Button
          label="Open full input screen"
          secondary
          onPress={() => router.push({ pathname: '/day/[dayId]/input', params: { dayId } })}
        />
      </DayMilestoneTile>

      {/* Accordion Milestone 2: Think & Outline */}
      <DayMilestoneTile
        id="prep"
        number={2}
        icon="bulb-outline"
        title="Think & 4-Line Outline"
        subtitle={
          thinking?.submittedAt && outline
            ? '4 thoughts saved · 4-line outline ready'
            : 'Form your own view without AI assistance'
        }
        status={
          thinking?.submittedAt && outline
            ? 'completed'
            : activeMilestone === 'prep'
              ? 'current'
              : 'locked'
        }
        expanded={expandedId === 'prep'}
        onToggle={() => toggleMilestone('prep')}
      >
        <Text style={{ fontSize: 13, color: theme.ink, lineHeight: 19 }}>
          Fill 4 blank thinking boxes (What happened, Why, Consequences, What do I think), then
          build a crisp 4-line speaking skeleton.
        </Text>

        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 14,
            padding: 14,
            borderWidth: 1,
            borderColor: theme.line,
            gap: 6,
          }}
        >
          <View
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Text style={{ fontSize: 13, fontWeight: '600', color: theme.ink }}>
              4 Thinking Boxes
            </Text>
            <Text
              style={{
                fontSize: 12,
                fontWeight: '700',
                color: thinking?.submittedAt ? theme.success : theme.caution,
              }}
            >
              {thinking?.submittedAt ? 'Submitted ✓' : 'Pending'}
            </Text>
          </View>
          <View
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Text style={{ fontSize: 13, fontWeight: '600', color: theme.ink }}>
              4-Line Outline
            </Text>
            <Text
              style={{
                fontSize: 12,
                fontWeight: '700',
                color: outline ? theme.success : theme.caution,
              }}
            >
              {outline ? 'Ready ✓' : 'Pending'}
            </Text>
          </View>
        </View>

        <Button
          label={outline ? 'Review my outline' : 'Build my outline'}
          onPress={() =>
            router.push({
              pathname: (!thinking?.submittedAt
                ? '/day/[dayId]/prep'
                : '/day/[dayId]/outline') as '/day/[dayId]/prep',
              params: { dayId },
            })
          }
        />
      </DayMilestoneTile>

      {/* Accordion Milestone 3: Take 1 Studio */}
      <DayMilestoneTile
        id="take1"
        number={3}
        icon="videocam-outline"
        title="Take 1 (Studio Baseline)"
        subtitle={
          take1
            ? `Baseline recorded (${Math.round(take1.durationS ?? 0)}s)`
            : 'Front camera · Authentic baseline recording'
        }
        status={take1 ? 'completed' : activeMilestone === 'take1' ? 'current' : 'locked'}
        expanded={expandedId === 'take1'}
        onToggle={() => toggleMilestone('take1')}
      >
        <Text style={{ fontSize: 13, color: theme.ink, lineHeight: 19 }}>
          Record your first attempt. No teleprompter, no restart for the first 30 seconds. This is
          your pure baseline before any coaching.
        </Text>

        {take1 ? (
          <View
            style={{
              backgroundColor: '#EAF4ED',
              borderRadius: 14,
              padding: 14,
              borderWidth: 1,
              borderColor: '#BBF7D0',
              gap: 4,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '700', color: theme.success }}>
              Take 1 Recorded Successfully ✓
            </Text>
            <Text style={{ fontSize: 12, color: theme.ink }}>
              Duration: {Math.round(take1.durationS ?? 0)} seconds · Stored locally
            </Text>
          </View>
        ) : (
          <Button
            label="Open Studio for Take 1"
            onPress={() => router.push({ pathname: '/day/[dayId]/studio', params: { dayId } })}
          />
        )}
      </DayMilestoneTile>

      {/* Accordion Milestone 4: AI Coach Analysis */}
      <DayMilestoneTile
        id="coach"
        number={4}
        icon="sparkles-outline"
        title="AI Coach Analysis"
        subtitle={
          coach
            ? `Score: ${coach.row?.overall ?? 7}/10 · 3-Pillar Action Plan ready`
            : 'Objective feedback on Structure, Language & Delivery'
        }
        status={coach ? 'completed' : activeMilestone === 'coach' ? 'current' : 'locked'}
        expanded={expandedId === 'coach'}
        onToggle={() => toggleMilestone('coach')}
      >
        <Text style={{ fontSize: 13, color: theme.ink, lineHeight: 19 }}>
          In-depth multi-pillar evaluation: Structure & Framing, Language & Clarity, Delivery &
          Vocal Presence, plus an executive scorecard.
        </Text>

        {coach ? (
          <View style={{ gap: 10 }}>
            <View
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 14,
                padding: 14,
                borderWidth: 1,
                borderColor: theme.line,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <View>
                <Text style={{ fontSize: 12, color: theme.muted }}>Overall Score</Text>
                <Text style={{ fontSize: 24, fontWeight: '800', color: theme.ink }}>
                  {coach.row?.overall ?? 7}
                  <Text style={{ fontSize: 14, color: theme.muted }}> / 10</Text>
                </Text>
              </View>
              {coach.row?.paceWpm != null && (
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 12, color: theme.muted }}>Speaking Pace</Text>
                  <Text style={{ fontSize: 20, fontWeight: '700', color: theme.ink }}>
                    {Math.round(coach.row.paceWpm)} WPM
                  </Text>
                </View>
              )}
            </View>

            <Button
              label="View 3-Pillar Action Plan & Scorecard"
              onPress={() => router.push({ pathname: '/day/[dayId]/coach', params: { dayId } })}
            />
          </View>
        ) : (
          <Button
            disabled={!take1}
            label={take1 ? 'Analyse Take 1 with Coach' : 'Record Take 1 to unlock'}
            onPress={() => router.push({ pathname: '/day/[dayId]/coach', params: { dayId } })}
          />
        )}
      </DayMilestoneTile>

      {/* Accordion Milestone 5: Take 2 Reshoot */}
      <DayMilestoneTile
        id="take2"
        number={5}
        icon="refresh-outline"
        title="Take 2 (Targeted Reshoot)"
        subtitle={
          take2
            ? `Take 2 recorded (${Math.round(take2.durationS ?? 0)}s)`
            : 'Apply priority corrections from Coach'
        }
        status={take2 ? 'completed' : activeMilestone === 'take2' ? 'current' : 'locked'}
        expanded={expandedId === 'take2'}
        onToggle={() => toggleMilestone('take2')}
      >
        <Text style={{ fontSize: 13, color: theme.ink, lineHeight: 19 }}>
          Re-record your speech focusing on applying at most 2–3 key adjustments from your Coach
          Action Plan.
        </Text>

        {take2 ? (
          <View
            style={{
              backgroundColor: '#EAF4ED',
              borderRadius: 14,
              padding: 14,
              borderWidth: 1,
              borderColor: '#BBF7D0',
              gap: 4,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '700', color: theme.success }}>
              Take 2 Reshoot Recorded ✓
            </Text>
            <Text style={{ fontSize: 12, color: theme.ink }}>
              Duration: {Math.round(take2.durationS ?? 0)} seconds
            </Text>
          </View>
        ) : (
          <Button
            disabled={!coach}
            label={coach ? 'Open Studio for Take 2' : 'Review Coach first to unlock'}
            onPress={() => router.push({ pathname: '/day/[dayId]/studio', params: { dayId } })}
          />
        )}
      </DayMilestoneTile>

      {/* Accordion Milestone 6: Comparison (Delta) */}
      <DayMilestoneTile
        id="compare"
        number={6}
        icon="git-compare-outline"
        title="Take 1 vs Take 2 Comparison"
        subtitle={
          delta
            ? 'Before & after comparison report complete'
            : 'Side-by-side progression & delta score'
        }
        status={delta ? 'completed' : activeMilestone === 'compare' ? 'current' : 'locked'}
        expanded={expandedId === 'compare'}
        onToggle={() => toggleMilestone('compare')}
      >
        <Text style={{ fontSize: 13, color: theme.ink, lineHeight: 19 }}>
          See exactly how much you improved between Take 1 and Take 2 across pacing, structure, and
          verbal clarity.
        </Text>

        <Button
          disabled={!take2}
          label={
            delta
              ? 'View Comparison Report'
              : take2
                ? 'Compare Take 1 & Take 2'
                : 'Save Take 2 to unlock'
          }
          onPress={() => router.push({ pathname: '/day/[dayId]/compare', params: { dayId } })}
        />
      </DayMilestoneTile>

      {/* Accordion Milestone 7: Hidden Live Question */}
      <DayMilestoneTile
        id="liveQ"
        number={7}
        icon="help-circle-outline"
        title="Live Follow-up Question"
        subtitle={
          liveAttempt
            ? 'Live spontaneous question answered'
            : '10s think · 45–60s spontaneous response'
        }
        status={liveAttempt ? 'completed' : activeMilestone === 'liveQ' ? 'current' : 'locked'}
        expanded={expandedId === 'liveQ'}
        onToggle={() => toggleMilestone('liveQ')}
      >
        <Text style={{ fontSize: 13, color: theme.ink, lineHeight: 19 }}>
          A surprise question you have not seen before. Practice spontaneous thinking on your feet
          under gentle time pressure.
        </Text>

        <Button
          disabled={!take2}
          label={
            liveAttempt
              ? 'View Live Q Response'
              : take2
                ? 'Reveal & Answer Live Question'
                : 'Complete Take 2 to unlock'
          }
          onPress={() => router.push({ pathname: '/day/[dayId]/follow-up', params: { dayId } })}
        />
      </DayMilestoneTile>

      {/* Accordion Milestone 8: Writing Desk & Diary */}
      <DayMilestoneTile
        id="reflect"
        number={8}
        icon="journal-outline"
        title="Writing Desk & Reflection"
        subtitle={
          writing?.submittedAt && diary
            ? 'Written compression & private diary complete'
            : 'Solidify your learning with written practice'
        }
        status={
          writing?.submittedAt && diary
            ? 'completed'
            : activeMilestone === 'reflect'
              ? 'current'
              : 'locked'
        }
        expanded={expandedId === 'reflect'}
        onToggle={() => toggleMilestone('reflect')}
      >
        <Text style={{ fontSize: 13, color: theme.ink, lineHeight: 19 }}>
          Compress your thoughts in writing and record private notes on how confident you felt.
        </Text>

        <View style={{ gap: 8 }}>
          <Button
            secondary
            label={writing?.submittedAt ? 'Review Writing (Done ✓)' : 'Open Writing Desk'}
            onPress={() => router.push({ pathname: '/day/[dayId]/desk', params: { dayId } })}
          />
          <Button
            secondary
            label={diary ? 'Review Private Diary (Done ✓)' : 'Open Private Diary'}
            onPress={() => router.push({ pathname: '/day/[dayId]/diary', params: { dayId } })}
          />
        </View>
      </DayMilestoneTile>

      {/* Accordion Milestone 9: Preparation for Day 2 */}
      <DayMilestoneTile
        id="day2"
        number={9}
        icon="rocket-outline"
        title={day.dayNo === 30 ? 'Programme Completion' : `Preparation for Day ${day.dayNo + 1}`}
        subtitle={
          nextPolicy ? `Next: "${nextPolicy.topic}"` : 'You have reached the final milestone!'
        }
        status={day.completedAt ? 'completed' : 'locked'}
        expanded={expandedId === 'day2'}
        onToggle={() => toggleMilestone('day2')}
      >
        {nextPolicy ? (
          <View style={{ gap: 10 }}>
            <View
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 14,
                padding: 14,
                borderWidth: 1,
                borderColor: theme.line,
                gap: 6,
              }}
            >
              <Text
                style={{ fontSize: 11, fontWeight: '700', color: theme.accent, letterSpacing: 0.5 }}
              >
                DAY {nextPolicy.dayNo} SNEAK PEEK
              </Text>
              <Text style={{ fontSize: 16, fontWeight: '700', color: theme.ink }}>
                {nextPolicy.topic}
              </Text>
              <Text style={{ fontSize: 13, color: theme.muted, lineHeight: 18 }}>
                Speaking target: {Math.round(nextPolicy.durationS / 60)} minutes · Framework:{' '}
                {nextPolicy.structure}
              </Text>
            </View>

            <Text style={{ fontSize: 12, color: theme.muted, fontStyle: 'italic' }}>
              {day.completedAt
                ? `Day ${day.dayNo} is complete. You can begin Day ${nextPolicy.dayNo} anytime!`
                : `Complete all Day ${day.dayNo} milestones above to unlock Day ${nextPolicy.dayNo}.`}
            </Text>

            {day.completedAt && (
              <Button
                label={`Start Day ${nextPolicy.dayNo}`}
                onPress={() => router.push('/progress')}
              />
            )}
          </View>
        ) : (
          <Text style={{ fontSize: 14, color: theme.ink }}>
            Congratulations on completing the entire 30-day curriculum!
          </Text>
        )}
      </DayMilestoneTile>
    </Screen>
  );
}
