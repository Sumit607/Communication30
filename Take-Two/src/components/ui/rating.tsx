import { Pressable, Text, View } from 'react-native';
import { theme } from '@/constants/theme';
export function Rating({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null;
  onChange: (value: number) => void;
}) {
  return (
    <View style={{ gap: 12 }}>
      <Text style={{ color: theme.muted, fontSize: 16 }}>{label}</Text>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable
            key={n}
            accessibilityRole="radio"
            accessibilityLabel={label + ': ' + n + ' of 5'}
            accessibilityState={{ selected: value === n }}
            onPress={() => onChange(n)}
            style={{
              height: 48,
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 7,
              borderWidth: 1,
              borderColor: value === n ? theme.accent : theme.border,
              backgroundColor: value === n ? theme.accent : 'transparent',
            }}
          >
            <Text style={{ fontSize: 17, color: value === n ? '#FFFFFF' : theme.muted }}>{n}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
