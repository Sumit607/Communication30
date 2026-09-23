import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { theme } from '@/constants/theme';

export type PillarData = {
  id: 'structure' | 'language' | 'delivery';
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  score: number;
  correction?: {
    at_s: number;
    quote: string;
    issue: string;
    fix: string;
  } | null;
  extraTool?: {
    type: 'say_this_instead' | 'word_for_today' | 'angle_you_missed' | 'pace_meter';
    title: string;
    content: React.ReactNode;
  } | null;
  checkpoints: {
    number: number;
    title: string;
    description: string;
    status?: 'strong' | 'needs_work' | 'target';
  }[];
  goldenRule: string;
};

export function ActionPillarCard({ pillar }: { pillar: PillarData }) {
  const [expanded, setExpanded] = useState(false);

  const badgeColor =
    pillar.score >= 7 ? theme.success : pillar.score >= 5 ? '#2B5797' : theme.caution;
  const badgeBg = pillar.score >= 7 ? '#EAF4ED' : pillar.score >= 5 ? '#EBF2FC' : '#FDF4E7';

  return (
    <View
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.line,
        overflow: 'hidden',
        marginBottom: 14,
      }}
    >
      {/* Header / Flash Card Summary */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${pillar.title}, score ${pillar.score} of 10. Tap to ${expanded ? 'collapse' : 'expand'} detailed analysis.`}
        onPress={() => setExpanded(!expanded)}
        style={({ pressed }) => ({
          padding: 18,
          backgroundColor: pressed ? '#F5F7FB' : '#FFFFFF',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
        })}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: badgeBg,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Ionicons name={pillar.icon} size={22} color={badgeColor} />
        </View>

        <View style={{ flex: 1, gap: 3 }}>
          <View
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Text style={{ fontSize: 16, fontWeight: '700', color: theme.ink }}>
              {pillar.title}
            </Text>
            <View
              style={{
                backgroundColor: badgeBg,
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 10,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: badgeColor }}>
                {pillar.score} / 10
              </Text>
            </View>
          </View>
          <Text
            style={{ fontSize: 13, color: theme.muted }}
            numberOfLines={expanded ? undefined : 1}
          >
            {pillar.subtitle}
          </Text>
        </View>

        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color={theme.muted} />
      </Pressable>

      {/* Expanded 10-12 Point Deep Dive */}
      {expanded && (
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: theme.line,
            padding: 18,
            backgroundColor: '#FAFBFC',
            gap: 16,
          }}
        >
          {/* Audio Evidence / Direct Fix from Take 1 */}
          {pillar.correction && (
            <View
              style={{
                backgroundColor: '#FFF7EE',
                borderLeftWidth: 4,
                borderLeftColor: theme.caution,
                borderRadius: 12,
                padding: 14,
                gap: 6,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="alert-circle-outline" size={16} color={theme.caution} />
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '700',
                    color: theme.caution,
                    letterSpacing: 0.5,
                  }}
                >
                  SPECIFIC EVIDENCE IN TAKE 1 · {Math.floor(pillar.correction.at_s)}s
                </Text>
              </View>
              <Text style={{ fontSize: 14, fontStyle: 'italic', color: theme.ink, lineHeight: 20 }}>
                “{pillar.correction.quote}”
              </Text>
              <Text style={{ fontSize: 13, color: theme.muted, marginTop: 2 }}>
                <Text style={{ fontWeight: '600', color: theme.ink }}>Issue: </Text>
                {pillar.correction.issue}
              </Text>
              <View
                style={{ marginTop: 4, backgroundColor: '#FFFFFF', padding: 10, borderRadius: 8 }}
              >
                <Text style={{ fontSize: 13, fontWeight: '600', color: theme.accent }}>
                  💡 Direct Fix for Take 2:
                </Text>
                <Text style={{ fontSize: 13, color: theme.ink, marginTop: 2, lineHeight: 18 }}>
                  {pillar.correction.fix}
                </Text>
              </View>
            </View>
          )}

          {/* Associated Power Tool / Extra Tool */}
          {pillar.extraTool && (
            <View
              style={{
                backgroundColor: '#F0F4FF',
                borderRadius: 12,
                padding: 14,
                borderWidth: 1,
                borderColor: '#D4E2FF',
                gap: 6,
              }}
            >
              <Text
                style={{ fontSize: 12, fontWeight: '700', color: theme.accent, letterSpacing: 0.5 }}
              >
                {pillar.extraTool.title.toUpperCase()}
              </Text>
              {pillar.extraTool.content}
            </View>
          )}

          {/* 10-12 Detailed Diagnostic Checkpoints */}
          <View style={{ gap: 10 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: theme.ink, marginTop: 4 }}>
              Detailed Communication Analysis & Checkpoints:
            </Text>

            {pillar.checkpoints.map((cp) => (
              <View
                key={cp.number}
                style={{
                  flexDirection: 'row',
                  gap: 12,
                  backgroundColor: '#FFFFFF',
                  padding: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: theme.line,
                }}
              >
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: theme.line,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '700', color: theme.ink }}>
                    {cp.number}
                  </Text>
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: theme.ink }}>
                    {cp.title}
                  </Text>
                  <Text style={{ fontSize: 13, color: theme.muted, lineHeight: 18 }}>
                    {cp.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Golden Rule Callout */}
          <View
            style={{
              backgroundColor: '#EAF4ED',
              borderRadius: 12,
              padding: 14,
              borderWidth: 1,
              borderColor: '#C8E6D3',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <Ionicons name="sparkles" size={20} color={theme.success} />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '700',
                  color: theme.success,
                  letterSpacing: 0.5,
                }}
              >
                THE GOLDEN RULE
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '500',
                  color: '#1E4634',
                  marginTop: 2,
                  lineHeight: 18,
                }}
              >
                {pillar.goldenRule}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
