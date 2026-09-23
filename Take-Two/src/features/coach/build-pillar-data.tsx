import { Text, View } from 'react-native';
import type { CoachResult } from '@/db/repositories/coaching';
import type { PillarData } from '@/components/cards/action-pillar-card';
import { theme } from '@/constants/theme';

export function buildPillarData(
  result: CoachResult,
  paceWpm?: number | null,
): [PillarData, PillarData, PillarData] {
  const structureFix = result.corrections.find((c) => c.category === 'structure');
  const deliveryFix = result.corrections.find((c) => c.category === 'delivery');
  const languageFix =
    result.corrections.find((c) => c.category !== 'structure' && c.category !== 'delivery') ||
    result.corrections.find((c) => c !== structureFix && c !== deliveryFix);

  // 1. Structure Pillar
  const structurePillar: PillarData = {
    id: 'structure',
    icon: 'git-network-outline',
    title: 'Pillar 1: Structure & Framing',
    subtitle: structureFix
      ? structureFix.issue
      : 'Logical progression, point-reason-example, and conclusion',
    score: result.scores.structure,
    correction: structureFix,
    extraTool: result.angle_you_missed
      ? {
          type: 'angle_you_missed',
          title: 'Perspective You Could Explore',
          content: (
            <Text style={{ fontSize: 13, color: theme.ink, lineHeight: 19 }}>
              {result.angle_you_missed}
            </Text>
          ),
        }
      : null,
    checkpoints: [
      {
        number: 1,
        title: 'Opening Hook & Core Stance',
        description:
          'Clear thesis established in your first sentence rather than meandering or prefacing.',
      },
      {
        number: 2,
        title: 'Single-Point Focus',
        description: 'One dominant central message that the listener can easily recall.',
      },
      {
        number: 3,
        title: 'P.R.E.P. Alignment',
        description:
          'Point → Reason (the "why") → Example (concrete evidence) → Point re-affirmed.',
      },
      {
        number: 4,
        title: 'Logical Connectors',
        description:
          'Using purposeful signposts ("First", "In contrast", "Therefore") between points.',
      },
      {
        number: 5,
        title: 'Handling Trade-Offs',
        description: 'Acknowledging counter-perspectives to build credibility and depth.',
      },
      {
        number: 6,
        title: 'Firm Conclusion Landing',
        description: 'Ending decisively on your recommendation without apologies or trailing off.',
      },
      {
        number: 7,
        title: 'Redundancy Filter',
        description:
          'Ensuring every sentence progresses your argument rather than repeating words.',
      },
      {
        number: 8,
        title: 'Balanced Time Allocation',
        description:
          'Optimal ratio: 20% opening, 60% evidence/examples, 20% call to action / ending.',
      },
      {
        number: 9,
        title: 'Audience Relevance',
        description: 'Answering the question: "Why does this matter to the listener right now?"',
      },
      {
        number: 10,
        title: 'Take 2 Structure Target',
        description: structureFix ? structureFix.fix : 'Keep the premise clear and land firmly.',
      },
    ],
    goldenRule: 'One sentence, one thought. Land each idea completely before starting the next.',
  };

  // 2. Language & Clarity Pillar
  const avgLanguageScore = Math.round((result.scores.clarity + result.scores.word_choice) / 2);
  const languagePillar: PillarData = {
    id: 'language',
    icon: 'text-outline',
    title: 'Pillar 2: Language & Clarity',
    subtitle: languageFix
      ? languageFix.issue
      : 'Word choice, crisp phrasing, and eliminating circularity',
    score: avgLanguageScore,
    correction: languageFix,
    extraTool: result.say_this_instead
      ? {
          type: 'say_this_instead',
          title: 'Say This Instead (Before & After)',
          content: (
            <View style={{ gap: 6, marginTop: 2 }}>
              <View style={{ backgroundColor: '#FBEBEB', padding: 8, borderRadius: 6 }}>
                <Text style={{ fontSize: 12, color: '#9B1C1C', fontWeight: '600' }}>
                  What you said:
                </Text>
                <Text style={{ fontSize: 13, color: '#771D1D', fontStyle: 'italic', marginTop: 1 }}>
                  “{result.say_this_instead.you_said}”
                </Text>
              </View>
              <View style={{ backgroundColor: '#EAF5EC', padding: 8, borderRadius: 6 }}>
                <Text style={{ fontSize: 12, color: '#03543F', fontWeight: '600' }}>
                  Sharper phrasing:
                </Text>
                <Text style={{ fontSize: 13, color: '#046C4E', fontWeight: '500', marginTop: 1 }}>
                  “{result.say_this_instead.instead}”
                </Text>
              </View>
            </View>
          ),
        }
      : result.word_for_today
        ? {
            type: 'word_for_today',
            title: `Word for Today: ${result.word_for_today.word}`,
            content: (
              <View style={{ gap: 2 }}>
                <Text style={{ fontSize: 13, color: theme.ink }}>
                  <Text style={{ fontWeight: '600' }}>Meaning: </Text>
                  {result.word_for_today.meaning}
                </Text>
                <Text
                  style={{ fontSize: 13, color: theme.muted, fontStyle: 'italic', marginTop: 2 }}
                >
                  “{result.word_for_today.use_it_here}”
                </Text>
              </View>
            ),
          }
        : null,
    checkpoints: [
      {
        number: 1,
        title: 'Precision Over Generalization',
        description:
          'Naming specific things instead of vague words like "stuff", "things", "good".',
      },
      {
        number: 2,
        title: 'Active Voice & Strong Verbs',
        description: 'Using dynamic verbs ("drives", "creates") over passive constructions.',
      },
      {
        number: 3,
        title: 'Circularity Prevention',
        description:
          'Avoiding defining a concept using the same word ("libraries are good because...").',
      },
      {
        number: 4,
        title: 'Spoken Sentence Length',
        description:
          'Keeping spoken sentences under 15 words so the listener never loses the thread.',
      },
      {
        number: 5,
        title: 'Vocabulary Variety',
        description: 'Avoiding repeating the same adjective or noun multiple times in 30 seconds.',
      },
      {
        number: 6,
        title: 'Eliminating Weak Qualifiers',
        description: 'Dropping phrases that diminish confidence: "kind of", "sort of", "maybe".',
      },
      {
        number: 7,
        title: 'Concrete Imagery',
        description: 'Giving your listener tangible examples they can picture in their mind.',
      },
      {
        number: 8,
        title: 'Conversational Tone',
        description: 'Sounding natural and authentic, not like reading an academic paper.',
      },
      {
        number: 9,
        title: 'Clean Idiomatic Flow',
        description: 'Ensuring expressions sound natural to standard English listeners.',
      },
      {
        number: 10,
        title: 'Take 2 Language Target',
        description: languageFix ? languageFix.fix : 'Choose crisp words and remove repetition.',
      },
    ],
    goldenRule:
      'Precision over decoration. Simple words placed with intention carry the greatest weight.',
  };

  // 3. Delivery & Voice Pillar
  const avgDeliveryScore = Math.round(
    (result.scores.pace_pausing + result.scores.flow + result.scores.presence) / 3,
  );
  const formattedWpm = paceWpm ? Math.round(paceWpm) : null;
  const deliveryPillar: PillarData = {
    id: 'delivery',
    icon: 'mic-outline',
    title: 'Pillar 3: Delivery, Voice & Flow',
    subtitle: deliveryFix
      ? deliveryFix.issue
      : formattedWpm
        ? `Speaking pace: ${formattedWpm} WPM · Silence and pausing control`
        : 'Pacing, silence, breath control, and vocal inflection',
    score: avgDeliveryScore,
    correction: deliveryFix,
    extraTool: formattedWpm
      ? {
          type: 'pace_meter',
          title: `Speaking Pace: ${formattedWpm} WPM`,
          content: (
            <View style={{ gap: 4 }}>
              <Text style={{ fontSize: 13, color: theme.ink }}>
                {formattedWpm < 115
                  ? '⚠️ Slightly slow / hesitant pace. Aim to maintain steady momentum.'
                  : formattedWpm > 165
                    ? '⚠️ Rushed pace. Slow down to allow your listener to digest your points.'
                    : '✅ Optimal conversational speaking pace (Target: 125–155 WPM).'}
              </Text>
            </View>
          ),
        }
      : null,
    checkpoints: [
      {
        number: 1,
        title: 'Pacing & Cadence (WPM)',
        description: 'Optimal target is 130–150 words per minute for effortless listening.',
      },
      {
        number: 2,
        title: 'Filler Word Suppression',
        description: 'Replacing "um", "uh", "you know", and "like" with silent pauses.',
      },
      {
        number: 3,
        title: 'Intentional Pauses',
        description: 'Pausing for 1 second after key claims to give ideas time to land.',
      },
      {
        number: 4,
        title: 'Downward Inflection at Periods',
        description:
          'Lowering pitch at the end of statements to project authority (avoiding upspeak).',
      },
      {
        number: 5,
        title: 'Vocal Energy & Projection',
        description: 'Consistent volume and engagement from your first word to your last.',
      },
      {
        number: 6,
        title: 'Breath Control & Phrasing',
        description: 'Inhaling before thoughts rather than running out of air mid-sentence.',
      },
      {
        number: 7,
        title: 'Crisp Consonants',
        description: 'Clear articulation on the ends of words ("past", "fact", "impact").',
      },
      {
        number: 8,
        title: 'First-Three-Seconds Confidence',
        description: 'Starting immediately with energy and avoiding throat clearing.',
      },
      {
        number: 9,
        title: 'Embracing Stillness',
        description: 'Silence is not dead air; comfortable pauses demonstrate mastery.',
      },
      {
        number: 10,
        title: 'Take 2 Delivery Target',
        description: deliveryFix
          ? deliveryFix.fix
          : 'Take a calm breath and speak with steady pace.',
      },
    ],
    goldenRule: 'Silence is your punctuation. Pausing shows control; rushing shows anxiety.',
  };

  return [structurePillar, languagePillar, deliveryPillar];
}
