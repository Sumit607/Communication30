import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { theme } from '@/constants/theme';
import type { CoachResult } from '@/db/repositories/coaching';

interface ScorecardViewProps {
  scores: CoachResult['scores'];
  overallScore: number;
  paceWpm?: number | null;
}

interface MetricItem {
  id: keyof CoachResult['scores'];
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
}

const METRICS: MetricItem[] = [
  {
    id: 'structure',
    label: 'Structure & Framing',
    icon: 'git-network-outline',
    description: 'Logical sequence, point-first thesis, and decisive conclusion.',
  },
  {
    id: 'clarity',
    label: 'Clarity & Conciseness',
    icon: 'sparkles-outline',
    description: 'Crisp sentence structure, zero rambling, and low filler density.',
  },
  {
    id: 'word_choice',
    label: 'Word Choice & Precision',
    icon: 'book-outline',
    description: 'Rich vocabulary, punchy action verbs, and domain-fit terminology.',
  },
  {
    id: 'pace_pausing',
    label: 'Pace & Strategic Pausing',
    icon: 'speedometer-outline',
    description: 'Calm rhythm, allowing ideas to breathe with deliberate micro-pauses.',
  },
  {
    id: 'flow',
    label: 'Flow & Transitions',
    icon: 'shuffle-outline',
    description: 'Smooth narrative bridges between premises, reasons, and evidence.',
  },
  {
    id: 'presence',
    label: 'Vocal Presence & Conviction',
    icon: 'mic-outline',
    description: 'Estimated projection, energy, vocal variation, and persuasive tone.',
  },
];

export function ScorecardView({ scores, overallScore, paceWpm }: ScorecardViewProps) {
  const getBadgeColor = (val: number) => {
    if (val >= 8) return theme.success;
    if (val >= 6) return '#2B5797';
    return theme.caution;
  };

  const getBadgeBg = (val: number) => {
    if (val >= 8) return '#EAF4ED';
    if (val >= 6) return '#EBF2FC';
    return '#FDF4E7';
  };

  return (
    <View style={{ gap: 14 }}>
      {/* Executive Summary Card */}
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
        <Text
          style={{
            fontSize: 13,
            fontWeight: '700',
            color: theme.muted,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          Take 1 Diagnostic Benchmark
        </Text>
        <View
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <View>
            <Text style={{ fontSize: 32, fontWeight: '800', color: theme.ink }}>
              {overallScore}
              <Text style={{ fontSize: 18, color: theme.muted, fontWeight: '500' }}> / 10</Text>
            </Text>
            <Text style={{ fontSize: 13, color: theme.muted, marginTop: 2 }}>
              Holistic Effectiveness Score
            </Text>
          </View>

          {paceWpm != null && paceWpm > 0 && (
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 24, fontWeight: '800', color: theme.ink }}>
                {Math.round(paceWpm)}{' '}
                <Text style={{ fontSize: 13, color: theme.muted, fontWeight: '500' }}>WPM</Text>
              </Text>
              <Text style={{ fontSize: 13, color: theme.muted, marginTop: 2 }}>
                {paceWpm < 120
                  ? 'Deliberate / Slow'
                  : paceWpm <= 160
                    ? 'Optimal Conversational'
                    : 'Fast / Urgent'}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* 6 Dimension Progress Bars */}
      <View
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 18,
          padding: 18,
          borderWidth: 1,
          borderColor: theme.line,
          gap: 16,
        }}
      >
        <Text style={{ fontSize: 15, fontWeight: '700', color: theme.ink }}>
          Detailed Dimension Breakdown
        </Text>

        {METRICS.map((metric) => {
          const score = scores[metric.id] ?? 5;
          const color = getBadgeColor(score);
          const bg = getBadgeBg(score);
          const pct = Math.min(Math.max(score * 10, 5), 100);

          return (
            <View key={metric.id} style={{ gap: 6 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    flex: 1,
                    marginRight: 8,
                  }}
                >
                  <Ionicons name={metric.icon} size={18} color={color} />
                  <Text style={{ fontSize: 14, fontWeight: '600', color: theme.ink }}>
                    {metric.label}
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: bg,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '700', color }}>{score} / 10</Text>
                </View>
              </View>

              {/* Progress Bar Track */}
              <View
                style={{
                  height: 7,
                  backgroundColor: '#ECEEF2',
                  borderRadius: 4,
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    width: `${pct}%`,
                    height: '100%',
                    backgroundColor: color,
                    borderRadius: 4,
                  }}
                />
              </View>

              <Text style={{ fontSize: 12, color: theme.muted, lineHeight: 16 }}>
                {metric.description}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Benchmark Reference Guide */}
      <View
        style={{
          backgroundColor: '#F5F7FA',
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: theme.line,
          gap: 8,
        }}
      >
        <Text style={{ fontSize: 13, fontWeight: '700', color: theme.ink }}>
          Scoring Rubric Reference
        </Text>
        <View style={{ gap: 4 }}>
          <Text style={{ fontSize: 12, color: theme.muted }}>
            <Text style={{ fontWeight: '700', color: theme.success }}>8 – 10: Mastered </Text>
            Executive level clarity, natural pacing, and authoritative conviction.
          </Text>
          <Text style={{ fontSize: 12, color: theme.muted }}>
            <Text style={{ fontWeight: '700', color: '#2B5797' }}>6 – 7: Proficient </Text>
            Message is solid; minor improvements in brevity and transition flow needed.
          </Text>
          <Text style={{ fontSize: 12, color: theme.muted }}>
            <Text style={{ fontWeight: '700', color: theme.caution }}>
              1 – 5: Development Area{' '}
            </Text>
            Focus on the primary corrections above for your Take 2 reshoot.
          </Text>
        </View>
      </View>
    </View>
  );
}
