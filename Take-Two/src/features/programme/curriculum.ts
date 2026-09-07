export type DayPolicy = {
  dayNo: number;
  topic: string;
  structure: string;
  writing: 'long' | 'compression';
  essay: string;
  durationS: number;
  interaction: string;
  preparation: boolean;
  extended: boolean;
};
const rows: [string, string, string, number, string][] = [
  ['Tell me about yourself', 'none', 'Who am I?', 180, 'follow-up'],
  ['My college or MBA experience', 'free', '', 180, 'follow-up'],
  ['Is social media good or bad?', 'PREP', 'Better informed or just louder?', 180, 'follow-up'],
  ['Explain AI to a 12-year-old', 'simple explanation', '', 180, 'clarification'],
  [
    'What makes a good leader? Exactly three reasons.',
    '3-point',
    'The best leader I have seen up close',
    180,
    'counterexample',
  ],
  ['Tell a failure story without overexplaining', 'STAR', '', 180, 'clarification'],
  ['Week 1 test: a random topic', 'any', 'What changed this week?', 300, 'follow-up'],
  [
    'Should India focus more on manufacturing?',
    'PREP',
    'Manufacturing vs services',
    180,
    'counterargument',
  ],
  ['Explain sustainability, supply chain or inflation simply', '3-point', '', 180, 'clarification'],
  [
    'Work from home vs office',
    'both-sides',
    'Strongest case against my position',
    180,
    'disagreement',
  ],
  ['Five ambiguous questions: clarify before answering', 'clarification', '', 90, 'clarification'],
  ['Explain one project to a non-expert', 'STAR', 'One project properly told', 180, 'follow-up'],
  ['Casual conversation: movies, travel, friendship, habits', 'none', '', 180, 'casual'],
  [
    'Where do I see myself in 10 years?',
    '3-point',
    'Ten years out and the first step',
    300,
    'counterargument',
  ],
  ['Ten random topics: 15–90–15', 'impromptu', 'Random topic', 90, 'follow-up'],
  ['One news story: what, why, impact, view', 'news', '', 180, 'counterargument'],
  [
    'Choose a company problem and recommend a response',
    'problem-solving',
    'One decision that changed a company',
    180,
    'follow-up',
  ],
  ['Convince a friend to support an idea', 'persuasion', '', 180, 'disagreement'],
  [
    'Growth vs environment: argue both sides',
    'both-sides',
    'Steelman the side I disagree with',
    180,
    'counterexample',
  ],
  ['One issue in 60, 30 and 15 seconds', 'compression', '', 60, 'follow-up'],
  [
    'Week 3 test: a monologue with one interruption',
    'any',
    'Where I still lose the listener',
    420,
    'interruption',
  ],
  [
    'Standing delivery: hands, shoulders, voice and camera-facing',
    '3-point',
    'What confidence looks like from outside',
    180,
    'follow-up',
  ],
  ['Why you? Or: what is your biggest weakness?', 'PREP', '', 180, 'counterargument'],
  [
    'Address 100 people about a problem and solution',
    'problem-solving',
    'Memo to 100 people',
    300,
    'disagreement',
  ],
  ['Three things I would change in my city', '3-point', '', 180, 'counterargument'],
  [
    'Speak while the other side strongly disagrees',
    'both-sides',
    'Strongest case against something I believe',
    180,
    'disagreement',
  ],
  ['Random headline: start within 5 seconds', 'none', '', 180, 'follow-up'],
  [
    'A 10-minute structured talk',
    'long-form',
    'One topic, four sections, one argument',
    600,
    'counterargument',
  ],
  [
    'Simulation: conversation, professional problem and interview pressure',
    'mixed',
    '',
    180,
    'mixed',
  ],
  [
    'Final: tell me about yourself, then a random topic',
    'none',
    'Rewrite Day 1 and compare',
    180,
    'follow-up',
  ],
];
export const curriculum: DayPolicy[] = rows.map(
  ([topic, structure, essay, durationS, interaction], i) => ({
    dayNo: i + 1,
    topic,
    structure,
    essay,
    durationS,
    interaction,
    writing: essay ? 'long' : 'compression',
    preparation: ![1, 13, 27, 30].includes(i + 1),
    extended: [7, 14, 21, 28, 29, 30].includes(i + 1),
  }),
);
export function policyFor(dayNo: number) {
  const p = curriculum[dayNo - 1];
  if (!p) throw new Error('Unknown curriculum day.');
  return p;
}
export function outlineLabels(structure: string): string[] {
  const labels: Record<string, string[]> = {
    PREP: ['Point', 'Reason', 'Example', 'Point again'],
    STAR: ['Situation', 'Task', 'Action', 'Result'],
    '3-point': ['Position', 'First reason', 'Second reason', 'Third reason and close'],
    'both-sides': ['The question', 'Case for', 'Case against', 'My judgement'],
    news: ['What happened', 'Why', 'Impact', 'My view'],
    'problem-solving': ['Problem', 'Cause', 'Options', 'Recommendation'],
  };
  return labels[structure] ?? ['Opening', 'Main idea', 'Support', 'Close'];
}
