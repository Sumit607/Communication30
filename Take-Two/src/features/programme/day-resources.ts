export interface DayResource {
  dayNo: number;
  topic: string;
  youtube: {
    title: string;
    channel: string;
    duration: string;
    url: string;
  };
  article: {
    title: string;
    source: string;
    readTime: string;
    url: string;
    excerpt: string;
  };
  keyConcept: string;
}

const RESOURCES: Record<number, DayResource> = {
  1: {
    dayNo: 1,
    topic: 'Tell me about yourself',
    youtube: {
      title: 'How to Answer "Tell Me About Yourself" (The 3-Step Formula)',
      channel: 'Harvard Business Review',
      duration: '4 mins',
      url: 'https://www.youtube.com/watch?v=mmqTq_a0fsg',
    },
    article: {
      title: 'A Guide to Introducing Yourself with Real Impact',
      source: 'HBR Ascend',
      readTime: '3 min read',
      url: 'https://hbr.org/2019/09/a-guide-to-introducing-yourself',
      excerpt:
        'Start with your present focus, connect past achievements, and state where you are heading next. Avoid chronological rambling.',
    },
    keyConcept:
      'Present → Past → Future: Anchor on who you are today before detailing how you got here.',
  },
  2: {
    dayNo: 2,
    topic: 'My college or MBA experience',
    youtube: {
      title: 'How to Summarize Educational Highlights Concisely',
      channel: 'Stanford GSB',
      duration: '5 mins',
      url: 'https://www.youtube.com/watch?v=HAnw168huqA',
    },
    article: {
      title: 'Turning College Projects into Compelling Narratives',
      source: 'Fast Company',
      readTime: '4 min read',
      url: 'https://www.fastcompany.com/career-narratives',
      excerpt:
        'Focus on decision points, major challenges, and personal growth rather than course syllabi.',
    },
    keyConcept:
      'Highlight 1 pivotal turning point and what it taught you about working with people.',
  },
  3: {
    dayNo: 3,
    topic: 'Is social media good or bad?',
    youtube: {
      title: 'The P.R.E.P. Method for Clear Persuasion',
      channel: 'Toastmasters International',
      duration: '4 mins',
      url: 'https://www.youtube.com/watch?v=Yl_FJA_u1Kk',
    },
    article: {
      title: 'Better Informed or Just Louder? Structuring an Argument',
      source: 'The Atlantic',
      readTime: '4 min read',
      url: 'https://www.theatlantic.com/technology/social-media-framing',
      excerpt:
        'Point, Reason, Example, Point: Take a clear stance immediately rather than lingering on the fence.',
    },
    keyConcept: 'State your definitive conclusion first, then back it with one vivid proof point.',
  },
};

export function getDayResource(dayNo: number, topicTitle = 'Communication Practice'): DayResource {
  if (RESOURCES[dayNo]) {
    return RESOURCES[dayNo];
  }

  // Fallback template for any curriculum day
  return {
    dayNo,
    topic: topicTitle,
    youtube: {
      title: `Executive Communication: Mastering "${topicTitle}"`,
      channel: 'Communication Coach Academy',
      duration: '4 mins',
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(topicTitle + ' communication practice')}`,
    },
    article: {
      title: `Structuring Your Response: "${topicTitle}"`,
      source: 'Communication Insights',
      readTime: '3 min read',
      url: `https://www.google.com/search?q=${encodeURIComponent(topicTitle + ' concise communication tips')}`,
      excerpt:
        'Keep your message focused on one dominant point. Open directly, avoid unnecessary caveats, and finish decisively.',
    },
    keyConcept:
      'Structure beats speed: Organize your thoughts into Point, Reason, and Example before speaking.',
  };
}
