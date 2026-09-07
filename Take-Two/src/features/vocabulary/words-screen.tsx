import { asc } from 'drizzle-orm';
import { Text, View } from 'react-native';
import { Screen } from '@/components/ui/screen';
import { Body, Heading } from '@/components/ui/controls';
import { useDatabase } from '@/db/use-database';
import { vocab } from '@/db/schema';
import { theme } from '@/constants/theme';
export default function WordsScreen() {
  const { db } = useDatabase(), words = db.select().from(vocab).orderBy(asc(vocab.createdAt)).all();
  return <Screen title="Words"><Heading>Words worth using.</Heading><Body muted>One useful word from a real practice day. The Coach never rewards ornate vocabulary.</Body>{words.length ? words.map(word => <View key={word.id} style={{ backgroundColor: 'white', borderRadius: 20, padding: 20, gap: 8 }}><Text style={{ fontSize: 22, fontWeight: '700', color: theme.ink }}>{word.word}</Text><Body>{word.meaning}</Body><Body muted>{word.exampleSentence}</Body></View>) : <Body>No words saved yet. Ask Coach for feedback after your first recording.</Body>}</Screen>;
}
