import { eq } from 'drizzle-orm';
import { Text, View } from 'react-native';
import { Screen } from '@/components/ui/screen';
import { Body, Heading } from '@/components/ui/controls';
import { BottomNavigation } from '@/components/ui/bottom-navigation';
import { useDatabase } from '@/db/use-database';
import { feedback, confidenceRatings } from '@/db/schema';
import { activeProgramme, programmeDays } from '@/db/repositories/programme';
import { theme } from '@/constants/theme';
export default function ProgressScreen() {
  const { db } = useDatabase(), programme = activeProgramme(db), allDays = programmeDays(db);
  const completed = allDays.filter(day => day.completedAt).length;
  const scores = db.select({ overall: feedback.overall }).from(feedback).where(eq(feedback.kind, 'coach')).all().map(row => row.overall).filter((value): value is number => value !== null);
  const confidence = db.select().from(confidenceRatings).all();
  const before = confidence.map(row => row.beforeConfidence).filter((value): value is number => value !== null);
  const after = confidence.map(row => row.afterConfidence).filter((value): value is number => value !== null);
  return <View style={{ flex: 1, backgroundColor: '#F7F8FA' }}><Screen title="Progress" back={false}>
    <Heading>{completed === 0 ? 'Your baseline starts here.' : completed + ' of 30 days complete'}</Heading>
    <Body muted>{programme ? 'Built from your saved practice on this phone.' : 'Begin a day to create your local programme.'}</Body>
    <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 19, fontWeight: '700', color: theme.ink }}>Your evidence</Text>
      <Body>{scores.length ? 'Average Take 1 Coach score · ' + (scores.reduce((sum, value) => sum + value, 0) / scores.length).toFixed(1) + '/10' : 'No Coach score yet.'}</Body>
      <Body>{before.length && after.length ? 'Confidence before → after · ' + (before.reduce((sum, value) => sum + value, 0) / before.length).toFixed(1) + ' → ' + (after.reduce((sum, value) => sum + value, 0) / after.length).toFixed(1) : 'Confidence comparison appears after your first completed loop.'}</Body>
      <Body muted>AI scores describe the recording. Confidence is your own self-report.</Body>
    </View>
    <Body muted>Day 1 → Day 30 comparisons will use only completed local evidence. No progress is invented.</Body>
  </Screen><BottomNavigation active="progress" /></View>;
}
