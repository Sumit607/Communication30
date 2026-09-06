import { ScrollView, Text } from 'react-native';

export default function HomeScreen() {
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ flexGrow: 1, padding: 24, gap: 16 }}
    >
      <Text selectable style={{ fontSize: 24, fontWeight: '600' }}>
        Project setup complete
      </Text>
      <Text selectable style={{ fontSize: 16, lineHeight: 24 }}>
        Take Two is ready for development. Coach validation is still pending.
      </Text>
    </ScrollView>
  );
}
