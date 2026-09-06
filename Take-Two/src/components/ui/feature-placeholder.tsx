import { ScrollView, Text } from 'react-native';

type FeaturePlaceholderProps = {
  title: string;
};

export function FeaturePlaceholder({ title }: FeaturePlaceholderProps) {
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ flexGrow: 1, padding: 24, gap: 16 }}
    >
      <Text selectable accessibilityRole="header" style={{ fontSize: 24, fontWeight: '600' }}>
        {title}
      </Text>
      <Text selectable style={{ fontSize: 16, lineHeight: 24 }}>
        This feature is not implemented yet. Coach validation is still pending.
      </Text>
    </ScrollView>
  );
}
